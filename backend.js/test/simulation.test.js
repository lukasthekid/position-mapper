const {measure, generatePosition, getPositionFactor} = require('../server/utils/simulation');

test('calculate coordinates distance in meter', () =>{
    const start = [16.0281126,48.1798109];
    const end = [16.0312078,48.1798663];
    const distance = parseFloat(measure(start, end).toFixed(2));
    expect(distance).toBe(229.83);
});

test('calculate position of train with given speed', ()=>{
    const start = [16.0271126,48.198927];
    const end = [16.0837,48.1782347];
    const distance = parseFloat(measure(start, end).toFixed(2));
    const speed = 5.7364 // m per s
    const position = JSON.stringify(generatePosition(distance,start,end,speed));
    expect(position).toBe(JSON.stringify([ 16.02718036996385, 48.19890221857475 ]));

});

test('calculate position factor', () =>{
    const meter = 16.23;
    const speed = 5.112;
    const factor = parseFloat(getPositionFactor(meter,speed).toFixed(2));
    expect(factor).toBe(0.31);
});

