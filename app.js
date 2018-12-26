let fs = require('fs');
//let when  = require('node-promise').when;

fs.readFile('data.txt', 'utf8', function(err, data) {
    if (err) throw err;

    //parse the data
    data = data.split(/\n/);

    let masterList = [];

    for (let i = 0; i < data.length; i++) {
        let thisone = parseLine(data[i]);
        masterList.push(thisone);
    }
    //console.log(masterList);
    masterList.sort(function(a,b){
        if (a.date - b.date < 0) {
            return -1;
        }
        else if (a.date - b.date > 0) {
            return 1;
        }
        else {
            return 0;
        }
    });

    fillGuards(masterList);
    processGuards(masterList);

    masterList.forEach((item, index) => {
       if (parseInt(item.guard) === 2753) {
           console.log(item);
       }
    });

});

const processGuards = (masterList) => {
    let guardArray = new Array();
    masterList.forEach((value) => {
            guardArray.push(value.guard);
    });
    guardArray.sort();
    let distinctGuards = [...new Set(guardArray)];

    //console.log('guard array', guardArray);
    //console.log(masterList);

    let bestMatch = {
        guard : "",
        totalSleepTime : 0
    };

    let currentGuard = [];

    distinctGuards.forEach((value, index) => {

        currentGuard = masterList.filter((listItem) => {
            if ((listItem.guard === value) && (listItem.action !== 'start') ) {
                return listItem;
            }
        });

        let totalSleepTime = 0, sleepyTime;

        for (let i = 1; i < currentGuard.length; i+=2){
            sleepyTime = currentGuard[i].date - currentGuard[i-1].date;
            sleepyTime = Math.round(((sleepyTime % 86400000) % 3600000) / 60000);
            totalSleepTime += sleepyTime;
        }

        console.log(`Guard #${value} - Total Sleep: ${totalSleepTime}`);

    });

    //console.log(currentGuard);



    /*for (let i = 0; i < masterList.length; i++){
        if (masterList[i].action === 'start'){

            // check to make sure this isn't the first guard being processed.
            // push last guard object to guardArray so we can begin processing this new guard
            if (guardList.length > 0){
                guardList.push(currentGuard);
            }

            //set guard #
            currentGuard.guard = masterList[i].guard;
        } else if (masterList[i].action === 'wake') {
            // get how long he was asleep
            currentGuard.timeAsleep.push(masterList[i].date - masterList[i-1].date);
            currentGuard.totalSleepTime += masterList[i].date - masterList[i-1].date;
        }
    } */

};

const fillGuards = (masterList) => {
    // let defer = promise.defer();
    // console.log('defer', defer);
    for (let i = 0; i < masterList.length; i++){
        if (masterList[i].guard === null) {
            masterList[i].guard = findLastGuard(i, masterList);
        }
    }
};

const findLastGuard = (index, masterList) => {
    if ((index === 0) || (masterList[index].guard !== null)) {
        return masterList[index].guard;
    } else {
        return findLastGuard(index - 1, masterList);
    }
};

const createGuardObject = (masterList) => {

};

const parseLine = (currentLine) => {
    let date = getDate(currentLine);
    let line = getAction(currentLine);

    return {
        date : date,
        guard : line.guard,
        action : line.action
    };
};


const getDate = (currentLine) => {
    let start = currentLine.indexOf('[');
    let end = currentLine.indexOf(']');
    let timestamp = currentLine.slice(start+1,end).split(' ');

    return new Date(timestamp[0].split('-')[0],
                    timestamp[0].split('-')[1],
                    timestamp[0].split('-')[2],
                    timestamp[1].split(':')[0],
                    timestamp[1].split(':')[1]);
};

const getAction = (currentLine) => {
    let actionLine = currentLine.slice(currentLine.indexOf(']')+2, currentLine.length).split(' ');
    switch(actionLine[0]) {
        case 'Guard':
            return {
                guard : actionLine[1].slice(1),
                action : 'start'
            };
        case 'wakes':
            return {
                guard : null,
                action : 'wake'
            };
        case 'falls':
            return {
                guard : null,
                action : 'sleep'
            };
    }
};