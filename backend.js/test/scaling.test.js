const {calculateDistanceDelta, getMoreImportant} = require('../server/utils/jsonScaler');

test("Calculating distance delta-multiplier of current track to the bottomline with factor 2", () =>{
    const f = {properties:{fid:377863840}}
    const d = (calculateDistanceDelta(2,f));
    expect(d*10000/2).toBe(2);
});

test("get higher track in hierachy", () =>{
    const id1 = 162139055;
    const id2 = 162139047;
    const i = getMoreImportant(id1, id2);
    expect(i).toBe(id2);
})

test("get higher track in hierachy with an invalid track", () =>{
    const id1 = 162139055;
    const id2 = 16245;
    const i = getMoreImportant(id1, id2);
    expect(i).toBe(id1);
})