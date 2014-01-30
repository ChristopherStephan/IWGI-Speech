L.Control.Speechbar = L.Control.extend({
        options: {
                position: 'topright',
                title: 'Shows a list of speech commands'
                //forceSeparateButton: false,
               
				
				
        },

        onAdd: function (map) {
                var className = 'leaflet-control-speechbar', container;
                
               
                        container = L.DomUtil.create('div', 'leaflet-bar');
                
                
                this._createButton(this.options, className, container, map);

                return container;
				
        },
        
        _createButton: function (opts, className, container, fn, context) {
                var link = L.DomUtil.create('a', className, container);
                link.href = '#';
                link.title = opts.title;

                
                
                L.DomEvent
                        
                        .addListener(link, 'click', function(){
                                $(function () {
                                        $("#dialog").dialog().html($("#description"));
                                    });
                                    setTimeout(function () {
                                        $("#dialog").dialog("close");
                                        
                                    }, 5000);
				//sidebarSpeech.toggle();
                        }, context);
                return link;
        }
});



L.control.speechbar = function (options) {
        return new L.Control.Speechbar(options);
};