/*
 *  Project: RTCombat
 *  Description: Custom Animation Sequencer
 *  Author: Alex Baker
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
define(["jquery"], function ($) {
	(function ( $, window, document, undefined ) {
 
    // Create the defaults once
    var pluginName = 'sequencer',
        defaults = {
            propertyName: "value",
			zoomDuration: 500,
			zoomScalar: 1.2,
			animationDelay: 0,
			shakeCount: 10,
			shakeSpeed: 5,
			shakeDistance: -5,
			blastDuration: 2000
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        this._frame = 1;
		this._shakeCounter;
		
        this.init();
    }

    Plugin.prototype.init = function () {
 		console.log('init');
    };
	
	//Plugin.prototype.
	
	Plugin.prototype.zoom = function (options) {
		console.log('zoom from plugin', options);
		//console.log(this.element);
		//$(this.element).animate({scale: (options.percent / 100)}, 1000)
		var targetElement = (options.element != null) ? '#' + options.element : '#b';
		var duration = (options.duration != null) ? options.duration : this.options.zoomDuration;
		var scalar = (options.scalar != null) ? options.scalar : this.options.zoomScalar;
		var scaleText = 'scale('+scalar+','+scalar+')';
		
		$(targetElement).animate({transform: scaleText}, duration);
		//$(targetElement).animate({width: options.percent, height: options.percent}, duration);
		
		
    };
	
	Plugin.prototype.advanceAnimation = function (options) {
		console.log('advanceAnimation');
		
		var targetElement = (options.element != null) ? '#' + options.element : '#characterWrapper';
		var delay = (options.delay != null) ? options.delay : this.options.animationDelay;
		
		setTimeout(function() { 
			_frame = options.frame;
		
			if (_frame == 2) {
				$('#frame1').addClass('hidden');
				$('#frame2').removeClass('hidden');
				
			} else {
				$('#frame2').addClass('hidden');
				$('#frame1').removeClass('hidden');
			}
		}, delay);
		//$(targetElement).delay(delay);
    };
	
	Plugin.prototype.blast = function(options) {
		
		blastDuration = (options != null && options.blastDuration != null) ? options.duration : this.options.blastDuration;
		
		$('#blast').stop(true).removeClass('hidden').css({opacity: 1}).animate({opacity:0}, blastDuration);
	};
	
	Plugin.prototype.shakeScreen = function(options) {
		
		shakeCount = (options != null && options.shakeCount != null) ? options.shakeCount : this.options.shakeCount;
		_shakeCounter = shakeCount;
		
		this.moveIt(options);
	};
	
	Plugin.prototype.moveIt = function(options) {
		speed = (options != null && options.speed != null) ? options.speed : this.options.shakeSpeed;
		distance = (options != null && options.distance != null) ? options.distance : this.options.shakeDistance;
		var that = this;
		
		_shakeCounter--;
		
		if (_shakeCounter > 0) {
			var top = (Math.random() * distance) +"%", 
			    left = (Math.random() * distance) + "%";

			$('#wrapper').animate({top: top, left:left}, speed, function() { that.moveIt(options); });
		} else {
			$('#wrapper').animate({top: "-5%", left:"-5%"}, speed);
		}
	};
	
	Plugin.prototype.callback = function(options) {
		if (options != null && options.callback != null && typeof(options.callback == 'function')) {
			
			if (options.delay != null) {
				var thatFunction = options.callback;
				setTimeout(function() { thatFunction()}, options.delay);
			} else {
				options.callback();
			}
		}
	};
	

    // You don't need to change something below:
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations and allowing any
    // public function (ie. a function whose name doesn't start
    // with an underscore) to be called via the jQuery plugin,
    // e.g. $(element).defaultPluginName('functionName', arg1, arg2)
    $.fn[pluginName] = function ( options ) {
        var args = arguments;

        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {

                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });

        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };
})( $, window, document );
});