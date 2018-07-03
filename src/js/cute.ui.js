
(function ($) {
    var cute = window.cute,
		proxy = $.proxy,
		NS = "cuteButtonGroup",
		CUTEBUTTONGROUP = "cute-buttongroup",
		CUTEBUTTON = "cute-button",
        SELECTEDSTATE = "cute-state-selected";

    var ButtonGroup = {
        init: function (element, options) {
            var that = this;

            that.options = $.extend(that.options, options);
            that.element = that.wrapper = element;

            element.addClass(CUTEBUTTONGROUP);

            element.find(">li").addClass(CUTEBUTTON);

            var elementCount = element.find(">li").length;
            element.find(">li").css("width", (100 / elementCount) + "%")

            element
                .on("click", ">li", proxy(that._click, that));

            var selected = that.element.find(">li." + SELECTEDSTATE)

            that.select(selected.length > 0 ? selected.index() : 0);

            element.data(NS, that);

            return element;
        },
        options: {
            name: "ButtonGroup"
        },
        _click: function (e, f) {
            var item = $(e.target);
            this.select(item.index());
        },
        _change: function (item) {
            if (typeof this.options.change == "function") {
                this.options.change(item)
            }
        },
        select: function (index) {
            if (index !== undefined) {
                var item = $(this.wrapper.find(">li")[index]);
                if (item.length > 0) {
                    this.wrapper.find(">li").removeClass(SELECTEDSTATE).data("selected", false);
                    item.addClass(SELECTEDSTATE).data("selected", true);
                    this._change(item);
                    return index;
                }
            } else {
                var item = this.wrapper.find(">li." + SELECTEDSTATE);
                return item.index();
            }
        }
    }

    $.fn[NS] = function (options) {
        return ButtonGroup.init(this, options);
    };

}(jQuery));