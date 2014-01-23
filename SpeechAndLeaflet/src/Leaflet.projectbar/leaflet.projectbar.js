L.Control.Projectbar = L.Control.extend({
        options: {
                position: 'topright',
                title: 'Shows a list of projects'
                //forceSeparateButton: false,
               
				
				
        },

        onAdd: function (map) {
                var className = 'leaflet-control-projectbar', container;
                
               
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
                            
							showProjects();
							sidebarProjects.toggle();
                        }, context);
                return link;
        }
});



L.control.projectbar = function (options) {
        return new L.Control.Projectbar(options);
};