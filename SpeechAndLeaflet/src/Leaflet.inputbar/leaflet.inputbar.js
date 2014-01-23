L.Control.Inputbar = L.Control.extend({
        options: {
                position: 'topright',
                title: 'Shows a form for input'
                //forceSeparateButton: false,
               
				
				
        },

        onAdd: function (map) {
                var className = 'leaflet-control-inputbar', container;
                
               
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
                            
							sidebarPoint.toggle();
                        }, context);
                return link;
        }
});



L.control.inputbar = function (options) {
        return new L.Control.Inputbar(options);
};