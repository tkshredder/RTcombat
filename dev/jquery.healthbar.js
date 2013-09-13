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
			maxHP: 100,
			avatarOffset: 50, 
			defaultAnimSpeed: 300,
			animSpeed: 300
        };
		
	var hb;

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

        damage: function(amount) {
            this.options.currentHP -= amount;
			if (this.options.currentHP < 0) this.options.currentHP = 0;
        },
		
		setCurrentHP: function(value) {
			this.options.currentHP = value;
		},
		setMaxHP: function(value) {
			this.options.maxHP = value;
		},
		getCurrentHP: function() {
			return this.options.currentHP;
		},
		getMaxHP: function() {
			return this.options.currentHP;
		},
		
		updateHealthBar: function() {
			
			currentHP = this.options.currentHP;
			maxHP = this.options.maxHP;
			avatarOffset = this.options.avatarOffset;
			
			var hpRatio = currentHP / maxHP;
			var hbWidth = $('.hb_gauge').width();
			var offset = -(hbWidth - (hpRatio * hbWidth));
			$('.hb_gauge').stop(true).animate({left: offset}, animSpeed);
			
			if ($('.hb_avatar').hasClass('fixed') == false) {
				$('.hb_avatar').stop(true).animate({left: offset+hbWidth-avatarOffset}, animSpeed);
			}
		}
		
    };



	// A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations and allowing any
    // public function (ie. a function whose name doesn't start
    // with an underscore) to be called via the jQuery plugin,
    // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            return this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
            });
        }
    }




    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    /*$.fn[pluginName] = function ( methodOrOptions ) {
		
		//console.log('methods: ', methods);
		
		if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            //return methods.init.apply( this, arguments );
			if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, methodOrOptions ));
            }
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.healthbar' );
        }
		
		
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, methodOrOptions ));
            }
        });
				
    };*/

})( jQuery, window, document );