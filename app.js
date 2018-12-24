let fs = require('fs');

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

    console.log(masterList);
    fillGuards(masterList);
    //let guardList = createGuardObject(masterList);
});

const fillGuards = (masterList) => {
    for (let i = 0; i < masterList.length; i++){
        if (masterList[i].guard === null) {
            let lastGuardSeen = findLastGuard(i, masterList);
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