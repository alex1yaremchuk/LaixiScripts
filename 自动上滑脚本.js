"auto";
console.log("调整大小...");
console.setSize(100, 100);
sleep(1000);
console.log("调整位置...");
console.setPosition(0, 200);


console.show();
sleep(1000);


slidingByCurve();
for(var i = 1; i < 1000 ;i++)
{
log("www.laixi.app");
log("-------------------------------");
    log("👁Views:"+ i )
    sleepTime = randomRangeTime(7,20);  //每个视频随机时间 7-20s random time 7-20s
    log("☕︎Time:" + sleepTime/1000 + "s");
    sleep(sleepTime);
    // slidingByLine();
    slidingByCurve();
}
log("exit...");
sleep(2000);
console.hide();
 
/**
 * 从下往上滑动，随机坐标
 */
function slidingByLine(){
    // top X,Y范围
    tx = randomPointLoc(500,600);
    ty = randomPointLoc(300,400);
    // bottom X，Y 范围
    bx = randomPointLoc(400,700);
    by = randomPointLoc(1880,2000);
 
    log("sliding ("+ bx +"," + by +"), ("+ tx +"," + ty +")")
    log("X: "+ Math.abs(bx-tx) + " Y: "+ Math.abs(by - ty));
    slidingTime = randomRangeTime(0.8,1.3);
    swipe(bx,by ,tx ,ty ,slidingTime);
}
 
/**
 * 从下往上滑动，曲线滑动,随机坐标
 */
function slidingByCurve(){
    // top X,Y范围
    tx = randomPointLoc(500,600);
    ty = randomPointLoc(300,400);
    // bottom X，Y 范围
    bx = randomPointLoc(400,700);
    by = randomPointLoc(1880,2000);
 
    log("☝action:\n"+ bx +"," + by +", "+ tx +"," + ty +"")
    log("X: "+ Math.abs(bx-tx) + " Y: "+ Math.abs(by - ty));
    slidingTime = randomRangeTime(0.2,0.6);
    sml_move(bx,by ,tx ,ty ,slidingTime);
}
 
/**
 * 随机位置点
 * @param {起始值} start 
 * @param {结束值} end 
 * @returns 
 */
 function randomPointLoc(start,end){
    len = end -start; 
    loc = Math.floor(Math.random() * len) + start;
    return loc;
}
 
/**
 * 从几秒到几秒
 * @param {开始秒} start 
 * @param {结束秒} end 
 * @returns
 */
function randomRangeTime(start,end){
    len = (end -start)*1000; 
    ms = Math.floor(Math.random() * len) + start*1000;
    return ms;
}
 
/**
 * 秒转毫秒 
 * @param {秒} sec 
 * @returns 
 */
function secToMs(sec){
    return sec*1000;
}
 
/**
 * 仿真随机带曲线滑动 
 * @param {起点x} qx 
 * @param {起点y} qy 
 * @param {终点x} zx 
 * @param {终点y} zy 
 * @param {滑动时间，单位毫秒} time 
 */
function sml_move(qx, qy, zx, zy, time) {
    var xxy = [time];
    var point = [];
    var dx0 = {
        "x": qx,
        "y": qy
    };
 
    var dx1 = {
        "x": random(qx - 100, qx + 100),
        "y": random(qy , qy + 50)
    };
    var dx2 = {
        "x": random(zx - 100, zx + 100),
        "y": random(zy , zy + 50),
    };
    var dx3 = {
        "x": zx,
        "y": zy
    };
    for (var i = 0; i < 4; i++) {
 
        eval("point.push(dx" + i + ")");
 
    };
    // log(point[3].x)
 
    for (let i = 0; i < 1; i += 0.08) {
        xxyy = [parseInt(bezier_curves(point, i).x), parseInt(bezier_curves(point, i).y)]
 
        xxy.push(xxyy);
 
    }
 
    // log(xxy);
    gesture.apply(null, xxy);
}
 
function bezier_curves(cp, t) {
    cx = 3.0 * (cp[1].x - cp[0].x); 
    bx = 3.0 * (cp[2].x - cp[1].x) - cx; 
    ax = cp[3].x - cp[0].x - cx - bx; 
    cy = 3.0 * (cp[1].y - cp[0].y); 
    by = 3.0 * (cp[2].y - cp[1].y) - cy; 
    ay = cp[3].y - cp[0].y - cy - by; 
    
    tSquared = t * t; 
    tCubed = tSquared * t; 
    result = {
        "x": 0,
        "y": 0
    };
    result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x; 
    result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y; 
    return result; 
};
