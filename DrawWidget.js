/*
https://github.com/parenparen/DrawWidget.js

Copyright 2013 Derek Mueller
Released under the MIT license
http://opensource.org/licenses/MIT
*/

DrawWidget.debug = true;

function DrawWidget (argsDict) {

    var defaultPropsDict = {
        name: 'default',
        parentElement: null,
        x: 0,
        y: 0,
        width: 200,
        height: 173
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    // public properties
    this.currColor; // string containing currently selected color
    this.currTool; // string containing currently selected tool

    // private properties
    this._world = null; // object returned by prototypes.js

    this._init ();

}


/*
Static Methods
*/



/*
Private Instance Methods
*/

/*
Private method. Sets up an interactive canvas using the prototypes.js 
library.
*/
DrawWidget.prototype._setUpCanvas = function () {
    var that = this;

    this._world = new World ({
        name: this.name + 'DwWorld',
        x: this.x,
        y: this.y,
        width: this.width, 
        height: this.height,
        parentElement: this.parentElement,
        suppressEvtFns: false
    });

    this._world.makeActive ();
    var newRegion = new Region ({name: "UI_0"});

    var surface = new CommonThing ({
        'name': 'surface',
        'clearOnDraw': false
    });

    var toolPoint = surface.addCircle ({
        x: -1000000,
        y: -1000000,
        radius: 5
    });

    surface.addDragFunction (function (mouseX, mouseY) {
        toolPoint.moveTo (mouseX, mouseY);
        if (that.currTool === 'eraser') 
            toolPoint.color = 'white';
        else
            toolPoint.color = that.currColor;
        surface.refreshCanvases ();
    }, true);
    
    newRegion.addThing (surface);

    this._world.addRegion (newRegion);

    this._world.changeRegion ("UI_0");
    this._world.start ();
};

/*
Private method which sets up the toolbar. Toolbar setup involves 
creation of html elements corresponding to toolbar buttons.
*/
DrawWidget.prototype._setUpToolbar = function () {
    var that = this;
    var toolbar = $('<div>', {
        class: 'dw-toolbar'
    });

    var colors = [
        'black', 
        'white', 
        'red', 
        'orange', 
        'yellow', 
        'green', 
        'blue', 
        'indigo', 
        'violet'
    ];

    // add drawing tools
    $(toolbar).append (
        $('<table>').append (
            $('<tr>').append (
                $('<td>', {
                    class: 'dw-tool draw-tool',
                    name: 'pen',
                    title: 'pen'
                }).append (
                    $('<span>+</span>')
                )/*.append (
                    $('<img>', {
                        src: 'images/penIcon.png',
                        alt: 'Pen'
                    })
                )*/,
                $('<td>', {
                    class: 'dw-tool erase-tool',
                    name: 'eraser',
                    title: 'eraser'
                }).append (
                    $('<span>-</span>')
                )
            )
        )
    );

    // drawing tool selection behavior
    var drawTool = $(toolbar).find ('.draw-tool');
    var eraseTool = $(toolbar).find ('.erase-tool');
    $(drawTool).on ('click', function () {
        $(this).addClass ('clicked');
        $(eraseTool).removeClass ('clicked');
        that.currTool = $(this).attr ('name');
    });
    $(eraseTool).on ('click', function () {
        $(this).addClass ('clicked');
        $(drawTool).removeClass ('clicked');
        that.currTool = $(this).attr ('name');
    });

    // add colors
    var table = $(toolbar).children ().first ();
    for (var i = 0; i < colors.length; ++i) {
        $(table).append (
            $('<tr>').append (
                $('<td>', {
                    class: 'dw-color dw-' + colors[i],
                    name: colors[i],
                    title: colors[i]
                }).append (
                    $('<span>' + colors[i][0] + '</span>')
                )
            )
        );
        if (i < colors.length - 1) {
            ++i;
            $(table).find ('tr').last ().append (
                $('<td>', {
                    class: 'dw-color dw-' + colors[i],
                    name: colors[i],
                    title: colors[i]
                }).append (
                    $('<span>' + colors[i][0] + '</span>')
                )
            );
        } else if (i === colors.length - 1) {
            $(table).find ('tr').last ().append (
                $('<td>', {
                    class: 'dw-dummy-cell'
                }).append (
                    $('<span>')
                )
            );
        }
    }

    // color click behavior
    $(table).find ('.dw-color').on ('click', function () {
        $(table).find ('.dw-color.clicked').removeClass ('clicked');
        $(this).addClass ('clicked');
        that.currColor = $(this).attr ('name');
    });


    // initial toolbar settings
    $(table).find ('.dw-black').addClass ('clicked');
    that.currColor = 'black';
    $(table).find ('.draw-tool').addClass ('clicked');
    that.currTool = 'pen';

    $(this.parentElement).after ($(toolbar));
};

/*
Private method which initializes canvas and toolbar
*/
DrawWidget.prototype._init = function () {

    $(this.parentElement).addClass ('dw-canvas-container');
    this._setUpCanvas ();
    this._setUpToolbar ();

};



/*
Public Instance Methods
*/


/*
Returns string containing name of currently selected color
*/
DrawWidget.prototype.getCurrColor = function () {
    return this.currColor;
};

/*
Returns string containing URL of png containing image currently drawn 
on this draw widget
*/
DrawWidget.prototype.getDataURL = function () {
    if (this._world === null) return; 
    return (
        this._world.currRegion.things.surface.getTopCanvas ().
        toDataURL ()
    );
};

