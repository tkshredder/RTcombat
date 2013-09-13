/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {
    // Create the defaults once
    var pluginName = "healthbar",
        defaults = {
            currentHP: 100,
			maxHP: 100
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
		this.$el = $(element);
		this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.options
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.options).
			
			this.$el.addClass('healthbar');
			this.$el.append('<span class="hb_mask"><span class="hb_bg"></span><span class="hb_gauge"></span></span><span class="hb_avatar drowcruiser"></span>');
        },

        damage: function(el, options) {
            // some logic
			console.log('damage');
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
		
		/*function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.healthbar' );
        }*/   
		
    };

})( jQuery, window, document );