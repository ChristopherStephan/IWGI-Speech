L.Control.Speechbar = L.Control.extend({
    options: {
        position: 'topright',
        title: 'Shows a list of speech commands'
        //forceSeparateButton: false,



    },

    showDialog: function () {
        $(function () {
            $("#dialog").dialog({
                width: 1300,
                height: 600,
                position: ['top', 53],
            }).html($('<img width="1300px" height="600px" src="src/custom/commands.gif">'));
        });
        setTimeout(function () {
            $("#dialog").dialog("close");

        }, 13000);
    },
	
	
	hideDialog: function (){
		$(function () {
			$("#dialog").dialog("close");
		});
	},	

    onAdd: function (map) {
        var className = 'leaflet-control-speechbar',
            container;


        container = L.DomUtil.create('div', 'leaflet-bar');


        this._createButton(this.options, className, container, map);

        return container;

    },

    _createButton: function (opts, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.href = '#';
        link.title = opts.title;



        L.DomEvent

        .addListener(link, 'click', function () {
            $(function () {
                $("#dialog").dialog({
                    width: 1300,
                    height: 600,
                    position: ['top', 53],
                }).html($('<img width="1300px" height="600px" src="src/custom/commands.gif">'));
            });
            setTimeout(function () {
                $("#dialog").dialog("close");

            }, 10000);
            //sidebarSpeech.toggle();
        }, context);
        return link;
    }
});



L.control.speechbar = function (options) {
    return new L.Control.Speechbar(options);
};