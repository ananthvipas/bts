var fieldMap = [];
var mapFinish = 0;
var nodes = [];
var global = {};
var ctx = null;
var availableMoves = [
    { x: 0, y: -1 },	/* forward */
    { x: -1, y: -1 },	/* forward and left */
    { x: -1, y: 0 },	/* left */
    { x: -1, y: 1 },	/* back and left */
    { x: 0, y: 1 },	/* back */
    { x: 1, y: 1 },	/* back and right */
    { x: 1, y: 0 },	/* right */
    { x: 1, y: -1 }	/* forward and right */
];

function rnd(min, max) { return min + Math.floor(Math.random() * (max - min)); }

function buildNewMap() {
    fieldMap = new Array(global.fH);
    for (var h = 0; h < global.fH; h++) {
        fieldMap[h] = new Array(global.fW);
        for (var w = 0; w < global.fW; w++)
            fieldMap[h][w] = 0;
    }

    var size = global.fW * global.fH;
    mapFinish = rnd(size / 3, size / 1.5); // Adjusted for slightly more density
}

function buildNewNode(x, y) {
    return {
        pos: { x: x, y: y }, pre: { x: x, y: y },
        stuckFactor: 0,
        tailLength: 0,
        turns: rnd(2, 5),
        move: function () {
            var moves = this.possibleMoves();
            var curMove = moves[rnd(0, moves.length)];
            var ox = this.pos.x;
            var oy = this.pos.y;
            var nx = this.pos.x + curMove.x;
            var ny = this.pos.y + curMove.y;
            this.stuckFactor -= 1;

            if (nx < 0 || ny < 0 || nx > (global.fW - 1) || ny > (global.fH - 1)) return null;
            if (fieldMap[ny][nx] == 1) return null;
            if (ox != nx && oy != ny && fieldMap[ny][ox] == 1 && fieldMap[oy][nx] == 1) return null;

            fieldMap[ny][nx] = 1;

            this.stuckFactor += 2;
            this.tailLength += 1;
            this.turns += curMove.type == 't' ? -1 : 0;
            this.pre = { x: ox, y: oy };
            this.pos = { x: nx, y: ny };
            return this.pos;
        },
        stuck: function () { return this.stuckFactor < -5; },
        possibleMoves: function () {
            var ax = this.pos.x - this.pre.x;
            var ay = this.pos.y - this.pre.y;
            if (ax == 0 && ay == 0) return [availableMoves[rnd(0, 7)]];

            var index = -1;
            for (var i = 0; i < availableMoves.length; i++)
                if (availableMoves[i].x == ax && availableMoves[i].y == ay)
                    index = i;

            var result = [availableMoves[index]];
            if (this.turns > 0) {
                var lIndex = index == 0 ? availableMoves.length - 1 : index - 1;
                var leftMove = { x: availableMoves[lIndex].x, y: availableMoves[lIndex].y, type: 't' };
                result.push(leftMove);

                var rIndex = index == availableMoves.length - 1 ? 0 : index + 1;
                var rightMove = { x: availableMoves[rIndex].x, y: availableMoves[rIndex].y, type: 't' };
                result.push(rightMove);
            }

            return result;
        }
    };
}

function init() {
    // Capture full document height for absolute positioning
    var fullHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    );

    global = { w: window.innerWidth, h: fullHeight, s: 12 };
    global.fW = Math.floor(global.w / global.s);
    global.fH = Math.floor(global.h / global.s);

    var canvas = document.getElementById('frame');
    if (canvas && canvas.getContext) {
        ctx = canvas.getContext('2d');
        canvas.width = global.w;
        canvas.height = global.h;

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 1.2; // Slightly thinner for "mild" look
        ctx.strokeStyle = "#2dd4bf"; // Technical Teal
        ctx.fillStyle = "#2dd4bf";
    }

    if (!nodes.length) {
        window.requestAnimationFrame(draw);
    }
}

function getNotFilled() {
    var open = [];
    for (var i = 0; i < fieldMap.length; i++)
        for (var j = 0; j < fieldMap[i].length; j++)
            if (fieldMap[i][j] == 0) open.push({ x: j, y: i });
    return open;
}

function rebuild(forceClear) {
    var open = getNotFilled();
    if (forceClear || open.length <= mapFinish) {
        if (ctx) ctx.clearRect(0, 0, global.w, global.h);
        buildNewMap();
        nodes = [];
    }

    if (nodes.length < 15) {
        var next = open[rnd(0, open.length)];
        if (next != undefined) nodes.push(buildNewNode(next.x, next.y));
    }
}

function draw() {
    window.requestAnimationFrame(draw);
    if (ctx == null) return;

    rebuild(false);

    ctx.beginPath();
    for (var i = 0; i < nodes.length; i++) {
        var cur_p = nodes[i].pos;
        var new_p = nodes[i].move();
        var correct = global.s / 2;

        if (new_p != null) {
            ctx.moveTo(cur_p.x * global.s + correct, cur_p.y * global.s + correct);
            ctx.lineTo(new_p.x * global.s + correct, new_p.y * global.s + correct);
        }

        if (nodes[i].tailLength <= 1 || nodes[i].stuck()) {
            var rad = global.s / 5;
            // Alternating colors between Teal and Gold for endpoints
            ctx.fillStyle = (i % 3 == 0) ? "#fbbf24" : "#2dd4bf";
            ctx.strokeStyle = (i % 3 == 0) ? "#fbbf24" : "#2dd4bf";
            ctx.moveTo(cur_p.x * global.s + rad + correct, cur_p.y * global.s + correct);
            ctx.arc(cur_p.x * global.s + correct, cur_p.y * global.s + correct, rad, 0, 6.28);
        }
    }
    ctx.stroke();
    ctx.fill();

    var new_nodes = [];
    for (var i = 0; i < nodes.length; i++)
        if (!nodes[i].stuck())
            new_nodes.push(nodes[i]);
    nodes = new_nodes;
}

window.addEventListener('resize', function () {
    init();
    rebuild(true);
});

document.addEventListener('DOMContentLoaded', init);
document.onclick = function () { rebuild(true); }
init();
