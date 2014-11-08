'use strict';

var World = function(width, height, cellsize, canvas){
    this.CELL_SIZE = cellsize || 8;
    this.X = width || 576;
    this.Y = height || 320;

    this.WIDTH = this.X / this.CELL_SIZE;
    this.HEIGHT = this.Y / this.CELL_SIZE;

    this.DELAY = 50;

    this.STOPPED = 0;
    this.RUNNING = 1;
    this.STATE = this.STOPPED;

    this.ALIVE = 1;
    this.DEAD = 0;

    this.CANVAS = document.getElementById(canvas) || document.getElementById('world');
    this.CONTEXT = this.CANVAS.getContext('2d');
    this.COUNTER = document.getElementById("counter");

    this.counter = 0;
    this.minimum = 2;
    this.maximum = 3;
    this.spawn = 3;


    this.grid = new Matrix(this.HEIGHT, this.WIDTH, this.DEAD).matrix;

    this.Cell = function(row, column) {
        this.row = row;
        this.column = column;

        return {
            row: this.row,
            column: this.column
        };
    };

    this.createWorld();

    return this;
};

World.prototype.canvasOnClickHandler = function(event) {
    var cell = this.getCursorPosition(event);
    var state = this.grid[cell.row][cell.column]
    == this.ALIVE ? this.DEAD : this.ALIVE;
    this.grid[cell.row][cell.column] = state;
    this.updateAnimations();
};

World.prototype.getCursorPosition = function(event) {
    var x;
    var y;
    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x = event.clientX
        + document.body.scrollLeft
        + document.documentElement.scrollLeft;
        y = event.clientY
        + document.body.scrollTop
        + document.documentElement.scrollTop;
    }

    x -= this.CANVAS.offsetLeft;
    y -= this.CANVAS.offsetTop;

    var cell = new this.Cell(Math.floor((y - 4) / this.CELL_SIZE),
        Math.floor((x - 2) / this.CELL_SIZE));
    return cell;
};

World.prototype.updateAnimations = function() {
    for (var h = 0; h < this.HEIGHT; h++) {
        for (var w = 0; w < this.WIDTH; w++) {
            if (this.grid[h][w] === this.ALIVE) {
                this.CONTEXT.fillStyle = "#000";
            } else {
                this.CONTEXT.fillStyle = "#eee";
            }
            this.CONTEXT.fillRect(
                w * this.CELL_SIZE +1,
                h * this.CELL_SIZE +1,
                this.CELL_SIZE -1,
                this.CELL_SIZE -1);
        }
    }
    this.COUNTER.innerHTML = this.counter;
};

World.prototype.createWorld = function(){
    if (this.CANVAS.getContext) {
        var offset = this.CELL_SIZE;

        for (var x = 0; x <= this.X; x += this.CELL_SIZE) {
            this.CONTEXT.moveTo(0.5 + x, 0);
            this.CONTEXT.lineTo(0.5 + x, this.Y);
        }
        for (var y = 0; y <= this.Y; y += this.CELL_SIZE) {
            this.CONTEXT.moveTo(0, 0.5 + y);
            this.CONTEXT.lineTo(this.X, 0.5 + y);
        }
        this.CONTEXT.strokeStyle = "#fff";
        this.CONTEXT.stroke();

        this.CANVAS.addEventListener("click", this.canvasOnClickHandler.bind(this), false);
    } else {
        alert("Canvas is unsupported in your browser.");
    }
};

World.prototype.calculateNeighbours = function(y, x) {
    var total = (this.grid[y][x] !== this.DEAD) ? -1 : 0;
    for (var h = -1; h <= 1; h++) {
        for (var w = -1; w <= 1; w++) {
            if (this.grid
                    [(this.HEIGHT + (y + h)) % this.HEIGHT]
                    [(this.WIDTH + (x + w)) % this.WIDTH] !== this.DEAD) {
                total++;
            }
        }
    }
    return total;
};

World.prototype.updateStates = function(){
    var neighbours;

    var nextGenerationGrid = new Matrix(this.HEIGHT, this.WIDTH, this.DEAD);

    for (var h = 0; h < this.HEIGHT; h++) {
        for (var w = 0; w < this.WIDTH; w++) {
            neighbours = this.calculateNeighbours(h, w);
            if (this.grid[h][w] !== this.DEAD) {
                if ((neighbours >= this.minimum) &&
                    (neighbours <= this.maximum)) {
                    nextGenerationGrid.matrix[h][w] = this.ALIVE;
                }
            } else {
                if (neighbours === this.spawn) {
                    nextGenerationGrid.matrix[h][w] = this.ALIVE;
                }
            }
        }
    }
    this.grid = nextGenerationGrid.copy();
    this.counter++;
};

World.prototype.updateScene = function(){
    this.updateAnimations();
};


World.prototype.updateWorld = function(){
    this.updateStates();
    this.updateScene();
};

World.prototype.start = function(){
    if(this.STATE === this.STOPPED)
    {
        var scope = this;
        this.interval = setInterval(function(){
            scope.updateWorld();
        }, this.DELAY);

        this.STATE = this.RUNNING;
    }
};

World.prototype.stop = function(){
    if(this.STATE === this.RUNNING){
        clearInterval(this.interval);
        this.STATE = this.STOPPED;
    };
};

World.prototype.reset = function(){
    this.stop();
    this.resetCounter();

    var clearGrid = new Matrix(this.HEIGHT, this.WIDTH, this.DEAD);

    this.grid = clearGrid.copy();

    this.updateAnimations();
};

World.prototype.resetCounter = function(){
    this.counter = 0;
    this.COUNTER.innerHTML = this.counter;
};

World.prototype.createTemplate = function(name){
    this.reset();

    var aliveCells = [];
    var wMidle = this.WIDTH>>1;
    var hMiddle = this.HEIGHT>>1;
    switch(name){
        case 'Rpentomino':
            aliveCells.push(new this.Cell(wMidle, hMiddle));
            aliveCells.push(new this.Cell(wMidle - 1, hMiddle));
            aliveCells.push(new this.Cell(wMidle, hMiddle - 1));
            aliveCells.push(new this.Cell(wMidle, hMiddle + 1));
            aliveCells.push(new this.Cell(wMidle + 1, hMiddle - 1));
            break;
        case 'Acorn':
            aliveCells.push(new this.Cell(wMidle+1, hMiddle));
            aliveCells.push(new this.Cell(wMidle+2, hMiddle));
            aliveCells.push(new this.Cell(wMidle-4, hMiddle));
            aliveCells.push(new this.Cell(wMidle-3, hMiddle));
            aliveCells.push(new this.Cell(wMidle-3, hMiddle-2));
            aliveCells.push(new this.Cell(wMidle-1, hMiddle-1));
        case 'Rabbits':
            aliveCells.push(new this.Cell(wMidle+1, hMiddle-1));
            aliveCells.push(new this.Cell(wMidle+2, hMiddle-1));
            aliveCells.push(new this.Cell(wMidle+2, hMiddle));
            aliveCells.push(new this.Cell(wMidle+3, hMiddle-1));


            aliveCells.push(new this.Cell(wMidle-1, hMiddle));
            aliveCells.push(new this.Cell(wMidle-2, hMiddle+1));
            aliveCells.push(new this.Cell(wMidle-2, hMiddle));
            aliveCells.push(new this.Cell(wMidle-3, hMiddle));
            aliveCells.push(new this.Cell(wMidle-3, hMiddle-1));
            break;
        default:
            aliveCells.push(new this.Cell(this.WIDTH>>1, this.HEIGHT>>1));
            break;
    }

    for(var i = 0; i < aliveCells.length; i++)
    {
        this.grid[aliveCells[i].column][aliveCells[i].row] = this.ALIVE;
    }

    this.updateAnimations();

};

function Matrix (height, width, initial) {
    this.width = width;
    this.height = height;
    this.initial = initial;


    this.matrix = this.create();

    return this;
};

Matrix.prototype.create = function(){
    var matrix = [];
    var tmp;

    for(var y = 0; y < this.height; y++)
    {
        tmp = [];
        for(var x = 0; x< this.width; x++)
        {
            tmp[x] = this.initial;
        }
        matrix[y] = tmp;
    }

    return matrix;
};



Matrix.prototype.copy = function(){
    var destination = this.create();
    for (var h = 0; h < this.height; h++) {
        destination[h] = this.matrix[h].slice(0);
    }
    return destination;
};

