if (Cute) {
    Cute.Kendo = {
        Version: "2015.2.727",

        init: function () {
            if (window.kendo) {
                kendo.ui.DateTimePicker.fn.options.format = "dd.MM.yyyy hh:mm";
                kendo.ui.DatePicker.fn.options.format = "dd.MM.yyyy";
                kendo.culture("tr-TR");
            }
        },

        // <summary>
        // Kendo ComboBox üzerindeki işlem yapar. (volkansendag - 2013.09.06)
        // </summary>
        ComboBox: {
            Standart: {
                placeholder: "Listeden uygun kaydı seçiniz.",
                height: 300,
                minLength: 3,
                delay: 600,
                filter: "contains",
                autoBind: false,
                change: function (e) {
                    e.sender.options._Change ? e.sender.options._Change(e) : !0;
                    if (e.sender.selectedIndex < 0) {
                        e.sender.value("");
                        e.sender.text("");
                    }
                }
            },
            Olustur: function (o) {
                if (typeof o !== "object") { return; }
                if (typeof o.change === 'function') { } // 
                o.change ? (o._Change = o.change, o.change = this.Standart.change) : !0;

                var ComboBox = new $(o.elementId).kendoComboBox($.extend({}, this.Standart, o)).data("kendoComboBox");
                tempData = {};
                if (o.Value > 0) {
                    tempData[ComboBox.options.dataValueField] = o.Value;
                    tempData[ComboBox.options.dataTextField] = o.Text ? o.Text : '';
                    ComboBox.dataSource.add(tempData);
                    ComboBox.value((o.Value ? o.Value : ""));
                }
                return ComboBox;
            }
        },

        Chart: {
            Standart: {
                legend: {
                    visible: false
                },
                chartArea: {
                    background: ""
                }
            },
            PDF: {
                init: function (chart) {
                    /// PDF butonu forma eklenmisse butona click eventi eklenir.
                    if (chart) {
                        var chartPdfButton = $(chart.element).closest(".allCharts").find(".chart-pdf");
                        if (chartPdfButton) {
                            chartPdfButton.click(function () {

                                var _fileName = "chart.pdf";
                                if (chart.options.title && chart.options.title.text)
                                    _fileName = chart.options.title.text + ".pdf"

                                chart.exportPDF().done(function (data) {
                                    kendo.saveAs({
                                        dataURI: data,
                                        fileName: _fileName
                                    });
                                });

                                if (chart.dataSource) {
                                    chart.dataSource.read();
                                }
                            });
                        }
                    }
                }
            },
            Refresh: {
                /// Yenile butonu forma eklenmisse butona click eventi eklenir.
                init: function (chart) {
                    var chartRefreshButton = $(chart.element).closest(".allCharts").find(".chart-refresh");
                    if (chartRefreshButton) {
                        chartRefreshButton.click(function () {
                            if (chart.dataSource) {
                                chart.dataSource.read();
                            }
                        });
                    }
                }
            },
            Olustur: function (o) {
                (typeof o == "string") ? o = { elementId: o } : !0;
                o = $.extend({}, Cute.Kendo.Chart.Standart, o);
                o.yazdir ? Cute.Kendo.Chart.Yazdir(o.elementId) : !0;
                o.yazdir ? Cute.Kendo.Chart.Yardim(o.elementId) : !0;
                var chart = $(o.elementId).kendoChart(o).data("kendoChart");

                this.PDF.init(chart);
                this.Refresh.init(chart);

                return chart;
            },
            printButtonHtml: '<div style="text-align: center; width: 100%;" class="chartPrint-div">'
				+ '<button class="k-button" type="button">Yazdır</button>'
				+ '<a class="k-button button-yardim sol" href="#" data-konu="Grafikler"><span class="icon-yardim k-icon"></span></a>'
				+ '</div>',
            Yazdir: function (o) {
                (typeof o == "string") ? o = { elementId: o } : !0;
                $(o.elementId).after(this.printButtonHtml);
                $(o.elementId).next(".chartPrint-div").find("button").click(function (e) {
                    cute.yazdir($.extend({
                        Head: '<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.common.min.css" rel="stylesheet" />' +
									'<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.default.min.css" rel="stylesheet" /> ' +
									'<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.dataviz.min.css" rel="stylesheet" /> ' +
									'<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.dataviz.default.min.css" rel="stylesheet" /> ' +
									'<style>html { font: 10pt sans-serif; } .k-grid td {border-width: 1px 0 0 1px;} .k-grid, .k-grid-content { height: auto !important; } .k-grid-toolbar, .k-grid-pager > .k-link { display: none; } </style>'
                    }, o));
                });
            },
            Yardim: function (o) {
                (typeof o == "string") ? o = { elementId: o } : !0;

                Cute.Yardim.Init({
                    elementId: $(o.elementId).next(".chartPrint-div").find(".button-yardim")
                });
            }
        },

        // <summary>
        // Web Servis üzerinden Kendo DataSource oluşturur. (volkansendag - 2013.07.01)
        // </summary>
        DataSource: {
            Olustur: function (o, d, f) {
                if (o === null || o.length < 1) { return; }
                if (typeof o !== "object") { var u = o; o = { Url: u, Data: d, serverFiltering: f }; }

                o.schema = $.extend({
                    data: function (r) {
                        if (r.Value) {
                            return r.Value;
                        } else if (r.Values) {
                            return r.Values;
                        } else if (r) {
                            return r;
                        }

                    }, total: function (r) {
                        return r.Count
                    }
                }, o.schema);

                return new kendo.data.DataSource($.extend({}, {
                    pageSize: 10,
                    transport: {
                        read: function (options) {
                            if (o.Data === undefined) o.Data = {};

                            if (options.data.filter) {
                                var filtrePost = {},
									filtreData = options.data.filter.filters;

                                $.each(filtreData, function (key, value) {
                                    o.Data[value.field] = value.value;
                                });
                            }

                            if (options.data.take > 0)
                                o.Data.Take = options.data.take;

                            if (options.data.skip > 0)
                                o.Data.Skip = options.data.skip;

                            Cute.AjaxPost($.extend({
                                Url: o.Url,
                                Data: o.Data,
                                Success: function (r) {
                                    (typeof o.ReadParameterMap == "function") ? o.ReadParameterMap(r.Result) : !0;
                                    options.success(r.Result);
                                },
                                Error: function () {
                                    options.error();
                                }
                            }, o));
                        }
                    }
                }, o));
            },
            FilterArray2Data: function (arr) {
                tempData = {}
                $.each(arr, function (i, v) {
                    if (!Cute.Validation.IsEmpty(v.ara_value)) {
                        tempData[v.ara_field] = v.ara_value;
                    }
                });
                return tempData;
            }
        },

        // <summary>
        // Kendo DatePicker üzerindeki işlem yapar. (volkansendag - 2013.09.06)
        // </summary>
        DatePicker: {
            Standart: {
                format: "dd.MM.yyyy",
                culture: "tr-TR"
            },
            Olustur: function (o) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId }; }
                var DatePicker = new $(o.elementId).kendoDatePicker($.extend({}, this.Standart, o)).data("kendoDatePicker");
                o.enable === false ? DatePicker.enable(false) : !0;
                return DatePicker;
            }
        },

        // <summary>
        // Kendo DateTimePicker üzerindeki işlem yapar. (volkansendag - 2013.09.06)
        // </summary>
        DateTimePicker: {
            Standart: {
                format: "dd.MM.yyyy HH:mm",
                culture: "tr-TR"
            },
            Olustur: function (o) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId }; }
                var DatePicker = new $(o.elementId).kendoDateTimePicker($.extend({}, this.Standart, o)).data("kendoDateTimePicker");
                o.enable === false ? DatePicker.enable(false) : !0;
                return DatePicker;
            }
        },

        // <summary>
        // Kendo DropDownList üzerindeki işlem yapar. (volkansendag - 2013.09.06)
        // </summary>
        DropDownList: {
            Standart: {
                optionLabel: "Seçiniz..."
            },
            Olustur: function (o) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId }; }
                var dropList_ = $(o.elementId).kendoDropDownList($.extend({}, this.Standart, o)).data("kendoDropDownList");
                return dropList_;
            }
        },

        // <summary>
        // Kendo Editör üzerindeki işlem yapar. (volkansendag - 2013.07.01)
        // </summary>
        Editor: {
            Standart: {
                encoded: false,
                stylesheets: ["Styles/editorStyle.css"],
                tools: [{
                    name: "formatting",
                    items: kendo ? kendo.ui.editor.FormattingTool.prototype.options.items : null
                }, "fontName", "fontSize", "bold", "italic", "underline", "strikethrough", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "insertUnorderedList", "insertOrderedList", "indent", "outdent", "createLink", "unlink", "insertImage", "subscript", "superscript", "createTable", "addRowAbove", "addRowBelow", "addColumnLeft", "addColumnRight", "deleteRow", "deleteColumn", "viewHtml", "foreColor", "backColor"
                ]
            },
            Olustur: function (o) {
                if (typeof o !== "object") { u = o; o = { elementId: u }; }
                //this.Standart.tools.unshift({
                //    name: "formatting",
                //    items: kendo.ui.editor.FormattingTool.prototype.options.items
                //});
                standart = this.Standart;
                return $(o.elementId).kendoEditor($.extend({}, standart, o)).data("kendoEditor");
            }
        },

        // <summary>
        // Kendo Grid üzerindeki işlem yapar (volkansendag - 2013.07.01)
        // </summary>
        Grid: {

            // <summary>
            // Kendo Grid için standart özellikleri belirler. (volkansendag - 2013.07.01)
            // </summary>
            Standart: {
                senkronData: [],
                autoBind: true,
                pageable: {
                    refresh: true,
                    pageSizes: true,
                    buttonCount: 7,
                    pageSizes: [10, 25, 50, 100, 500]
                },
                dataSource: {
                    pageSize: 10,
                    serverFiltering: true,
                    serverPaging: true,
                    serverSorting: true,
                },
                pageSize: 10,
                //selectable: "row",
                resizable: true,
                sortable: true,
                filterable: true,
                columnMenu: true,
                height: "99%",
                toolbar: [{ "name": "create", "text": "Yeni Ekle" }],
                editable: {
                    mode: "inline",
                    confirmation: "Kaydı silmek istediğinizden emin misiniz"
                },
                dataBound: function (e) {
                    this.Hazir = true;
                    e.sender.Editing = false;
                    var editable = e.sender.options.editable ? e.sender.options.editable : {};
                    if (editable.InsertOnly) {
                        e.sender.element.find(".k-grid-edit").css("display", "none");
                    }
                    e.sender.options._DataBound ? e.sender.options._DataBound(e) : !0;



                    var r = e.sender.options.editable;
                },
                remove: function (e) {
                    e.sender.options.formChangeControl ? (Cute.Form.Degisti(e.sender.options.elementId)) : !0;
                    e.sender.options._Remove ? e.sender.options._Remove(e) : !0;
                    e.sender.Editing = false;
                },
                saveChanges: function (e) {
                    e.sender.options.formChangeControl ? (Cute.Form.Kaydedildi(e.sender.options.elementId)) : !0;
                    e.sender.options._SaveChanges ? e.sender.options._SaveChanges(e) : !0;
                    e.sender.Editing = false;
                },
                edit: function (e) {
                    if (e.sender.options.editable ? (e.sender.options.editable.mode == "popup") : e.sender.options.editable) {
                        e.sender.editable.validatable._errorTemplate = kendo.template(Cute.Kendo.Validation.Templates.SpanRight);
                    }
                    e.sender.options.formChangeControl ? (e.container.find("input, select").change(function () {
                        Cute.Form.Degisti(e.sender.options.elementId);
                    })) : !0;

                    e.sender.Editing = true;

                    $(".k-grid-update").addClass("ifentertab");
                    $(".k-dropdown").addClass("ifentertab");
                    $(".k-textbox").addClass("ifentertab");
                    Cute.EnterTabInputs(".ifentertab", "k-grid-update");
                    Cute.Kendo.Grid.MinMaxInput(e);
                    e.sender.options._Edit ? e.sender.options._Edit(e) : !0;
                }
            },

            // <summary>
            // Kendo Grid oluşturur. (volkansendag - 2013.07.01)
            // </summary>
            Olustur: function (o) {
                if (typeof o !== "object") { return; }
                var self = this;
                o.edit ? (o._Edit = o.edit, o.edit = this.Standart.edit) : !0;
                o.remove ? (o._Remove = o.remove, o.remove = this.Standart.remove) : !0;
                o.saveChanges ? (o._SaveChanges = o.saveChanges, o.saveChanges = this.Standart.saveChanges) : !0;
                o.dataBound ? (o._DataBound = o.dataBound, o.dataBound = this.Standart.dataBound) : !0;
                if (o.pageable !== false)
                    o.pageable = $.extend({}, this.Standart.pageable, o.pageable);


                if (o.dataSource) {
                    o.dataSource.schema = $.extend({
                        data: function (r) {
                            if (r.Value) {
                                return r.Value;
                            }
                            else if (r.Values) {
                                return r.Values;
                            }
                            else if (r) {
                                return r;
                            }

                        },
                        total: "Count"
                    }, o.dataSource.schema);
                }



                var grid = new $(o.elementId).kendoGrid($.extend(true, {}, ((o.Standart !== false) ? this.Standart : {}), o)).data("kendoGrid");
                o.formChangeControl ? ($(o.elementId).find(".k-grid-cancel-changes").click(function () {
                    Cute.Form.Kaydedildi(o.elementId);
                })) : !0;

                if (typeof o.dblclick == "function") {
                    self._dblClickOlustur(grid, o);
                }

                self._toolbarClickOlustur(grid);

                Cute.Kendo.Grid.Yazdir.Init(grid);

                Cute.Kendo.Grid.Yardim.Init(grid);

                return grid;
            },

            _dblClickOlustur: function (grid, o) {
                grid.element.on("dblclick", "tbody>tr>td:not(.k-edit-cell)", "dblclick", function (e) {
                    e.preventDefault();
                    var tr = $(e.target).closest("tr"),
                        data = grid.dataItem(tr);

                    o.dblclick(data, grid);
                }).on("mouseenter", 'tbody>tr>td:not(.k-edit-cell)', "mouseenter", function (f) {
                    $(this).closest("tr").addClass("k-state-hover");
                }).on("mouseleave", 'tbody>tr>td:not(.k-edit-cell)', "mouseleave", function (f) {
                    $(this).closest("tr").removeClass("k-state-hover");
                });
            },

            _toolbarClickOlustur: function (grid) {
                if (grid && grid.options && grid.options.toolbar) {
                    $.each(grid.options.toolbar, function (i, v) {
                        if (v && v.click && typeof v.click == "function" && v.name) {
                            var proxyData = $.extend({}, grid);
                            proxyData["click-" + v.name] = v.click;
                            grid.element.on("click", '.k-grid-' + v.name, $.proxy(proxyData, "click-" + v.name));
                        }
                    })
                }
            },

            // <summary>
            // Kendo Grid boyutunda sorun olması durumunda gridi yeniler (volkansendag - 2013.09.25)
            // </summary>
            BoyutDuzenle: function (gridDiv) {

                setTimeout(function () {
                    var _grid = $(gridDiv).data("kendoGrid");
                    if (!_grid.Editing) {
                        //_grid.refresh();
                    }
                }, 500);
            },

            // <summary>
            // Kendo Grid kayıt okuma işlemi (volkansendag - 2013.07.01)
            // </summary>
            KayitOku: function (options, url, data, kayittamamfunc) {
                Cute.AjaxPost({
                    SonucuBekleme: true,
                    Url: url,
                    Data: $.extend({}, options.data, data),
                    Success: function (o) {
                        if (typeof kayittamamfunc === 'function') { kayittamamfunc(o); }

                        (typeof options.ReadParameterMap == "function") ? options.ReadParameterMap(o.Result) : !0;
                        options.success(o.Result);

                    },
                    Error: function (o) {
                        options.error(o);
                    }
                });
            },

            // <summary>
            // Kendo Grid kayıt silme işlemi (volkansendag - 2013.07.01)
            // </summary>
            KayitSil: function (options, url, data, grid) {
                Cute.AjaxPost({
                    Url: url,
                    SonucuBekleme: options.SonucuBekleme == true,
                    Data: $.extend({}, data),
                    Success: function (o) {
                        options.success((o.Result.Value ? o.Result.Value : o.Result.Values ? o.Result.Values : []));
                    },
                    Error: function (o) {
                        $(grid).data("kendoGrid").cancelChanges();
                    }
                });
            },

            // <summary>
            // Kendo Grid kayıt ekleme işlemi (volkansendag - 2013.07.01)
            // </summary>
            KayitEkle: function (options, url, data, kayittamamfunc, insertId) {
                Cute.AjaxPost({
                    SonucuBekleme: options.SonucuBekleme == true,
                    Url: url,
                    Data: $.extend({}, data),
                    Success: function (o) {

                        options.data[insertId ? insertId : "Id"] = o.Result.Value ? o.Result.Value : o.Result.Values;
                        options.success(options.data);
                        if (typeof kayittamamfunc === 'function') { kayittamamfunc(o); }
                    }
                });
            },

            // <summary>
            // Kendo Grid için kayıt okuma işlemi (volkansendag - 2013.07.01)
            // </summary>
            KayitDuzenle: function (options, url, data, kayittamamfunc) {
                Cute.AjaxPost({
                    SonucuBekleme: options.SonucuBekleme == true,
                    Url: url,
                    Data: $.extend({}, data),
                    Success: function (o) {
                        options.success(options.data);
                        if (typeof kayittamamfunc === 'function') { kayittamamfunc(o); }
                    }
                });
            },


            // <summary>
            // Kendo Grid Senkronizasyon işlemlerini yapar. (volkansendag - 2013.08.20)
            // </summary>
            SenkronizeEt: function (o) {
                if (typeof o !== "object") { obj = o; o = { elementId: obj }; }
                var Grid = $(o.elementId).data("kendoGrid");

                if (Grid) {

                    GridDataSource = Grid.dataSource;
                    TekrarsizField = GridDataSource.options ? GridDataSource.options.schema ? GridDataSource.options.schema.model ? GridDataSource.options.schema.model.TekrarsizField : null : null : null;

                    if (!($.isArray(TekrarsizField)) && (TekrarsizField != null)) {
                        TekrarsizField = [TekrarsizField];
                    }
                    if (TekrarsizField) {
                        var _destroyed = GridDataSource._destroyed;
                        $.each(GridDataSource._destroyed, function (a, b) {
                            $.each(GridDataSource._data, function (c, d) {
                                $.each(TekrarsizField, function (e, f) {
                                    sonuc = 0;
                                    $.each(TekrarsizField, function (g, h) {
                                        if (b[h] == d[h]) sonuc += 1;
                                    });
                                    if (d.isNew() && (TekrarsizField.length == sonuc)) {
                                        GridDataSource._data[c] = b;
                                        _destroyed = jQuery.grep(_destroyed, function (a) {
                                            return a[f] !== b[f];
                                        });
                                    }
                                });
                            });
                        });
                        GridDataSource._destroyed = _destroyed;
                    }
                    GridDataSource.sync();
                    GridDataSource.hazir = false;
                }
            },

            // <summary>
            // Kendo Grid üzerinde seçilmiş satırlara ait datayı Array olarak döndürür. (volkansendag - 2014.04.08)
            // </summary>
            SelectedData: function (o) {
                if (typeof o !== "object") { obj = o; o = { elementId: obj }; }

                (o.options) ? (o.options.name == "Grid") ? Grid = o : Grid = $(o.elementId ? o.elementId : o).data("kendoGrid") : Grid = null;

                if (!Grid)
                    return [];

                var rows = [];

                Grid.select().each(function () {
                    rows.push(Grid.dataItem($(this)));
                });
                return rows;
            },


            // <summary>
            // Object dataların Kendo Grid için uygun hale dönüştürme işlemi (volkansendag - 2013.07.01)
            // </summary>
            Obj2Xml: function (o) {
                var xmlResult = "";
                xmlResult = "<Table><row>";
                for (var name in o) {
                    xmlResult += "<" + name + ">" + o[name] + "</" + name + ">";
                }
                xmlResult += "</row></Table>";
                return xmlResult;
            },

            // <summary>
            // Kendo grid üzerinden alınan hataların gösterilmesi işlemi(volkansendag - 2013.07.01)
            // </summary>
            Error: function (a) {
                if (a.xhr) {
                    _result = a.xhr.Result;
                    if (_result) {
                        Cute.Mesaj.Goster({ mesaj: Cute.Exceptions(_result.MessageCode).Description, title: Cute.Exceptions(_result.MessageCode).Title });
                    } else {
                        Cute.Mesaj.Goster({ mesaj: a.xhr.message ? a.xhr.message : Cute.Exceptions().Description, title: Cute.Exceptions().Title });
                    }
                }
                return false;
            },

            // <summary>
            // Kendo grid üzerinde editlenen nesnelerin Minimum ve Maxmimun değerlerinin belirlenme işlemi(volkansendag - 2013.07.01)
            // </summary>
            MinMaxInput: function (e) {
                try {
                    if ($.isArray(e.sender.options.columns)) {

                        $.each(e.sender.options.columns, function (index, value) {
                            if (value.Min > 0) {
                                e.container.find("input[name=" + value.field + "]").attr("minlength", value.Min).attr("data-minLength-msg", 'En az <b>{1}</b> karakter giriniz.');
                                e.container.find("textarea[name=" + value.field + "]").attr("minlength", value.Min).attr("data-minLength-msg", 'En az <b>{1}</b> karakter giriniz.');
                            }
                            if (value.Max > 0) {
                                e.container.find("input[name=" + value.field + "]").attr("maxlength", value.Max);
                                e.container.find("textarea[name=" + value.field + "]").attr("maxlength", value.Max);
                            }
                        });
                    }
                } catch (err) { }

            },

            // <summary>
            // Kendo grid üzerinde yer alan veriyi yazdırır.(volkansendag - 2013.07.01)
            // </summary>
            Yazdir: {
                Init: function (grid) {
                    if (grid) {
                        if ($.isArray(grid.options.toolbar)) {
                            if ($.grep(grid.options.toolbar, function (v) { return v == "yazdir"; }).length > 0) {
                                grid.element.find(".k-grid-yazdir").remove();
                                grid.element.find(".k-grid-toolbar").append("<ul style='float:right;' class='k-grid-toolbarMenu'></ul>");
                                Cute.Kendo.Menu.Olustur({
                                    elementId: grid.element.find(".k-grid-toolbarMenu"),
                                    dataSource: [{
                                        text: "<span class='k-icon k-i-custom'></span> ",
                                        encoded: false,
                                        cssClass: "rightItem k-grid-Yazdir",
                                        items: [
											{
											    text: "Geçerli Sayfayı Yazdır",
											    exec: function (e) {
											        Cute.Kendo.Grid.Yazdir.sayfayiYaz($(e.item).closest('[data-role="grid"]'));
											    }
											},
											{
											    text: "Tüm Sayfaları Yazdır",
											    exec: function (e) {
											        Cute.Kendo.Grid.Yazdir.tumunuYaz($(e.item).closest('[data-role="grid"]'));
											    }
											}
                                        ]
                                    }]
                                });
                            }
                        }
                    }
                },
                sayfayiYaz: function (ef) {
                    elementIdP = $(ef);
                    gridP = elementIdP.data("kendoGrid");
                    if (gridP) {
                        elementIdP.find('[data-role="pager"]').hide();
                        elementIdP.find('.k-grid-toolbar').hide();
                        cute.yazdir({
                            elementId: elementIdP,
                            Head: '<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.common.min.css" rel="stylesheet" />' +
										'<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.default.min.css" rel="stylesheet" /> ' +
										'<style>html { font: 10pt sans-serif; } .k-grid td {border-width: 1px 0 0 1px;} .k-grid, .k-grid-content { height: auto !important; } .k-grid-toolbar, .k-grid-pager > .k-link { display: none; } </style>'
                        });
                        elementIdP.find('[data-role="pager"]').show();
                        elementIdP.find('.k-grid-toolbar').show();
                    }
                },
                tumunuYaz: function (ef) {
                    elementIdP = $(ef);
                    gridP = elementIdP.data("kendoGrid");
                    if (gridP) {
                        dataSourceP = gridP.dataSource;
                        pageSize = dataSourceP.pageSize();
                        total = dataSourceP.total();
                        gridP.one("dataBound", function () {
                            cute.yazdir({
                                elementId: elementIdP,
                                Head: '<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.common.min.css" rel="stylesheet" />' +
											'<link href="kendo/' + Cute.Kendo.Version + '/styles/kendo.default.min.css" rel="stylesheet" /> ' +
											'<style>html { font: 10pt sans-serif; } .k-grid td {border-width: 1px 0 0 1px;} .k-grid, .k-grid-content { height: auto !important; } .k-grid-toolbar, .k-grid-pager > .k-link { display: none; } </style>'
                            });
                            dataSourceP.pageSize(pageSize);
                            elementIdP.find('[data-role="pager"]').show();
                            elementIdP.find('.k-grid-toolbar').show();
                        });
                        elementIdP.find('[data-role="pager"]').hide();
                        elementIdP.find('.k-grid-toolbar').hide();
                        dataSourceP.pageSize(total);
                    }
                }
            },
            // <summary>
            // Kendo grid üzerinde yer alan veriyi yazdırır.(volkansendag - 2013.07.01)
            // </summary>
            Yardim: {
                Init: function (grid) {
                    if (grid) {
                        if ($.isArray(grid.options.toolbar)) {
                            _button = $.grep(grid.options.toolbar, function (v) { return v.name == "yardim"; });
                            if (_button.length > 0) {
                                grid.element.find(".k-grid-yardim").remove();
                                grid.element.find(".k-grid-toolbar").append('<a class="k-button button-yardim" href="#" data-konu="' + _button[0].konu + '"><span class="icon-yardim k-icon"></span></a>');
                                Cute.Yardim.Init({
                                    elementId: grid.element.find(".k-grid-toolbar .button-yardim")
                                });
                            }
                        }
                    }
                }
            },
            CheckAll: function (f) {
                var checkAll = $(this);
                checkAll.closest('[data-role="grid"]').find("tbody input:checkbox[name='Onay']").each(function (i, v) {
                    var check = $(this)
                    if (checkAll.is(':checked'))
                        check.closest("td").html('<input name="Onay" type="checkbox" checked="checked" />')
                    else
                        check.closest("td").html('<input name="Onay" type="checkbox" />')
                });
            }
        },

        ListView: {
            Standart: {

            },
            Olustur: function (o) {
                if (typeof o !== "object") { var elementId = o; o = { elementId: elementId }; }
                var element = new $(o.elementId).kendoListView($.extend({}, this.Standart, o)).data("kendoListView");
                return element;
            }
        },

        Pager: {
            Standart: {

            },
            Olustur: function (o) {
                if (typeof o !== "object") { var elementId = o; o = { elementId: elementId }; }
                var element = new $(o.elementId).kendoPager($.extend({}, this.Standart, o)).data("kendoPager");
                return element;
            }
        },

        // <summary>
        // Kendo Menü hazırlanması işlemleri (volkansendag - 2013.09.05)
        // </summary>
        Menu: {
            Standart: {
                animation: { open: { effects: false } },
            },
            Olustur: function (o, d) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId, menuData: d }; }
                if (o.menuData) {
                    o.dataSource = Cute.Kendo.Menu.Items();

                    _menuData = Cute.Kendo.Menu.EntityOlustur(o.menuData);
                    $.isArray(_menuData) ? ($.each(_menuData, function (i, v) {
                        o.dataSource.push(v);
                    })) : !0;
                }
                menu = $(o.elementId).kendoMenu($.extend({}, Cute.Kendo.Menu.Standart, {
                    select: Cute.Kendo.Menu.OnSelect
                }, o)).data("kendoMenu");

                return menu;
            },
            Items: function () {

                _text = "Hoşgeldiniz, <strong class='UstMenuKullaniciAdiSoyadi'>" + (Cute.Config.User.AdiSoyadi ? Cute.Config.User.AdiSoyadi : Cute.Config.User.Adi) + "</strong>";
                if (Cute.Config.User.Vekalet != null) {
                    _text += " (Vek.)";
                }
                _text += " (" + Cute.Config.User.BirimAdi + ")";

                return [{
                    textShort: "<span class='k-icon k-i-custom'></span>",
                    text: _text,
                    encoded: false,
                    cssClass: "rightItem kullaniciIkonu",
                    content: '<div class="k-content">'
											+ '<div class="k-rtl">'
												+ '<div style="width: 150px; float: right" id="KullaniciBilgilerim"></div>'
										+ '    </div>'
										+ '</div>'
                }];
            },
            EntityOlustur: function (arr) {
                if (!arr)
                    return null;

                var tempArray = [];
                $.each(arr, function (i, v) {
                    tempArray.push($.extend({}, {
                        id: v.MenuId,
                        text: v.Baslik,
                        tabUrl: v.Url,
                        items: Cute.Kendo.Menu.EntityOlustur(v.AltMenuler),
                        hedefSekme: v.HedefSekme
                    }, v));
                });
                return tempArray.length > 0 ? tempArray : null;
            },
            ItemData: function (e) {
                var item = $(e);
                var menuElement = item.closest(".k-menu");
                var kendoMenu = menuElement.data("kendoMenu");
                if (kendoMenu) {
                    var dataItem = kendoMenu.options.dataSource;
                    var index = item.parentsUntil(menuElement, ".k-item").map(function () {
                        return $(this).index();
                    }).get().reverse();
                    index.push(item.index());
                    for (var i = -1, len = index.length; ++i < len;) {
                        dataItem = dataItem[index[i]];
                        dataItem = i < len - 1 ? dataItem.items : dataItem;
                    }
                }
                return dataItem ? dataItem : e;
            },
            OnSelect: function (e) {

                funcs = Cute.Kendo.Menu.Functions;
                var item = $(e.item);
                var menuElement = item.closest(".k-menu");

                // Seçilen itemin menüsü farklı ise işlem iptal ediliyor.
                if (e.sender.element.attr("id") != menuElement.attr("id"))
                    return false;

                var dataItem = this.options.dataSource;
                var index = item.parentsUntil(menuElement, ".k-item").map(function () {
                    return $(this).index();
                }).get().reverse();

                index.push(item.index());

                for (var i = -1, len = index.length; ++i < len;) {
                    dataItem = dataItem[index[i]];
                    dataItem = i < len - 1 ? dataItem.items : dataItem;
                }
                if (dataItem) {
                    if (dataItem.hedefSekme) {
                        Cute.Kendo.Tab.FormGoster(dataItem.tabUrl, (dataItem.tabTitle ? dataItem.tabTitle : dataItem.text ? dataItem.text : 'İsimsiz'));
                    } else {
                        if (dataItem.tabUrl) {
                            func = $.grep(funcs, function (n, i) {
                                return n.name == dataItem.tabUrl;
                            });
                            func.length > 0 && func[0].func ? func[0].func(this) : !0;
                        }
                        if (typeof dataItem.exec == "function") {
                            dataItem.exec(e, dataItem);
                        }
                    }
                }
            },
            Functions: [
				{
				    name: "kullanimKilavuzu",
				    func: function (o) {
				        Cute.Kendo.Tab.FormGoster("Files/KullanimKilavuzu.html", "Kullanım Klavuzu");
				    }
				},
				{
				    name: "default",
				    func: function (o) {
				        Cute.Style.switch_style(this.name)
				    }
				},
                {
                    name: "black",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "blueopal",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "bootstrap",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "flat",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "highcontrast",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "metro",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "metroblack",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "moonlight",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "silver",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                },
                {
                    name: "uniform",
                    func: function (o) {
                        Cute.Style.switch_style(this.name)
                    }
                }
            ]
        },

        // <summary>
        // Kendo MultiSelect hazırlanması işlemleri (volkansendag - 2013.08.29)
        // </summary>
        MultiSelect: {
            Standart: {
                senkronData: [],
                placeholder: "Listeden seçiniz.",
                autoBind: true,
                height: 300,
                minLength: 3,
                filter: "contains"
            },

            // <summary>
            // Kendo MultiSelect üzerine yeni kelime eklenmesi işlemi. (volkansendag - 2013.08.20)
            // </summary>
            KelimeEkle: function (e) {
                var mSelect = $(e.elementId).data("kendoMultiSelect");
                addObj = {}
                addObj[mSelect.options.dataTextField] = e.Text;
                addObj[mSelect.options.dataValueField] = e.Value;

                var dataItems = mSelect._dataItems;
                $.each(dataItems, function () {
                    mSelect.dataSource.add(this);
                });
                mSelect.dataSource.add(addObj);
                var eski = (mSelect._old ? mSelect._old : []);
                mSelect._oldValues = eski;
                eski.push(e.Value);
                mSelect.value(eski);
            },

            // <summary>
            // Kendo MultiSelect üzerine verilerin getirilmesi işlemi . (volkansendag - 2013.08.20)
            // </summary>
            KelimeOku: function (o) {
                var mSelect = $(o.elementId).data("kendoMultiSelect");
                if (mSelect) {
                    mSelect.options.senkronData = [];
                    if (o.readValueUrl !== "" && o.readValueUrl !== undefined) {
                        Cute.AjaxPost({
                            Url: o.readValueUrl,
                            Data: o.readValueData,
                            Success: function (o) {
                                var d = o.Result.Values;
                                var values = [];
                                $.each(d, function (index, value) {
                                    tmpObj = {};
                                    tmpObj[mSelect.options.dataValueField] = value[mSelect.options.readValueField] ? value[mSelect.options.readValueField] : value[mSelect.options.dataValueField];
                                    tmpObj[mSelect.options.dataTextField] = value[mSelect.options.readTextField];
                                    mSelect.dataSource.add(tmpObj);
                                    values.push(value[mSelect.options.dataValueField]);
                                });
                                mSelect.value(values);
                                mSelect._oldValues = values;
                                mSelect.Veriler = d;
                                mSelect.VerilerIlk = values;
                            }
                        });
                    }
                }
            },

            // <summary>
            // Kendo MultiSelect Senkronizasyon işlemlerini yapar. (volkansendag - 2013.08.20)
            // </summary>
            SenkronizeEt: function (o) {
                if (typeof o !== "object") { obj = o; o = { elementId: obj }; };
                var mSelect = $(o.elementId).data("kendoMultiSelect");
                var onceki = mSelect.VerilerIlk,
					sonraki = mSelect.value();
                degisim = Cute.ArrayFarki(onceki, sonraki);

                if (mSelect.options.insertUrl) {
                    degisim.Eklenenler.forEach(function (e) {
                        data = mSelect.options.insertData;
                        data[mSelect.options.insertKeyField] = e;
                        Cute.AjaxPost({
                            Url: mSelect.options.insertUrl,
                            Data: data,
                            SonucuBekleme: true,
                            Success: function (o) {
                                var d = o.Result.Value;
                                newObj = {};
                                newObj[mSelect.options.dataValueField] = e
                                newObj[mSelect.options.dataKeyField] = d
                                mSelect.Veriler.push(newObj);
                            }
                        });
                    });
                };

                if (mSelect.options.deleteUrl) {
                    degisim.Silinenler.forEach(function (e) {
                        var id = jQuery.grep(mSelect.Veriler, function (value) {
                            return value[mSelect.options.dataValueField] == e;
                        })[0][mSelect.options.dataKeyField];

                        Cute.AjaxPost({
                            Url: mSelect.options.deleteUrl,
                            Data: { Id: id },
                            SonucuBekleme: true,
                            Success: function (o) {
                                mSelect.Veriler = jQuery.grep(mSelect.Veriler, function (value) {
                                    return value[mSelect.options.dataValueField] != e;
                                });
                            }
                        });
                    });
                }


            },

            // <summary> // TEST AMAÇLI
            // Kendo MultiSelect Senkronizasyon işlemlerini yapar. (volkansendag - 2013.08.20)
            // </summary>
            SenkronizeData: function (o) {
                if (typeof o !== "object") { obj = o; o = { elementId: obj }; };
                var mSelect = $(o.elementId).data("kendoMultiSelect");
                var onceki = mSelect.VerilerIlk,
					sonraki = mSelect.value();
                degisim = Cute.ArrayFarki(onceki, sonraki);
                var senkData = [];
                degisim.Eklenenler.forEach(function (e) {
                    var data = $.extend({}, mSelect.options.insertData);
                    data[mSelect.options.insertKeyField] = e;
                    senkData.push(data);
                });
                degisim.Silinenler.forEach(function (e) {
                    var id = jQuery.grep(mSelect.Veriler, function (value) {
                        return value[mSelect.options.dataValueField] == e;
                    })[0][mSelect.options.dataKeyField];
                    data = {};
                    data[mSelect.options.dataKeyField] = id;
                    senkData.push(data);
                });
                mSelect.options.senkronData = senkData;
            },

            // <summary>
            // Kendo MultiSelect oluşturma işlemi . (volkansendag - 2013.08.20)
            // </summary>
            Olustur: function (o) {
                if (typeof o !== "object") { return; };
                var changeFunc = o.change ? o.change : function () { };
                o.change = function (e) {
                    changeFunc(e);
                };
                var mSelect = new $(o.elementId).kendoMultiSelect($.extend({}, this.Standart, o)).data("kendoMultiSelect");


                // <summary>
                // Kendo MultiSelect nesnesine "," yada ";" işaretleri ile yeni değer ekleme özelliği kazandırılmıştır . (volkansendag - 2013.10.02)
                // </summary>
                if (o.yeniDegerEkleme) {  //  true girilmesi durumunda eklenecektir. (Varsayılan değer: false)
                    if (mSelect) {
                        var mInput = mSelect.input;
                        mInput.keypress(function (e) {
                            if (e.keyCode == 59 || e.keyCode == 44) {
                                mInputVal = mInput.val();
                                if (mInputVal.length > 2) {
                                    dataS = mSelect.dataSource.data();
                                    var mevcut;
                                    $.each(dataS, function () {
                                        if (this[mSelect.options.dataTextField].toLowerCase() == mInputVal.toLowerCase()) {
                                            mevcut = this;
                                        }
                                    });
                                    if (mevcut) {
                                        return false;
                                    } else {
                                        Cute.AjaxPost({
                                            Url: o.yeniDegerEklemeUrl ? o.yeniDegerEklemeUrl : "Services/BelgeAnahtarKelimeService.asmx/Ekle",
                                            Data: { Deger: mInput.val() },
                                            Alert: false,
                                            Success: function (oData) {
                                                if (oData.Result.Value) {
                                                    Cute.Kendo.MultiSelect.KelimeEkle({ Text: mInput.val(), Value: oData.Result.Value, elementId: o.elementId })
                                                }
                                            }
                                        });
                                    }
                                }
                                return false;
                            }
                        });
                    }
                }
                //

                this.KelimeOku(o);
                return mSelect;
            }
        },

        Notification: {
            Standart: {
                position: {
                    pinned: true,
                    left: "40%",
                    bottom: 30
                },
                templates: [{
                    type: "info",
                    template: '<div style="min-width: 250px;" class="uyari" #= data.containerid ? "id=" + containerid + "": "" #>'
                        + '<h3 style="text-align: center; margin: 10px;">#= message #</h2>'
                        + '</div>'
                }, {
                    type: "error",
                    template: '<div style="min-width: 250px;" class="uyari wrong-pass">'
                        + '<h3 style="text-align: center; margin: 10px;">#= message #</h2>'
                        + '</div>'
                }, {
                    type: "upload-success",
                    template: '<div style="min-width: 250px;" class="uyari upload-success">'
                        + '<h3 style="text-align: center; margin: 10px;">#= message #</h2>'
                        + '</div>'
                }],
                button: true,
                autoHideAfter:0,// 4000,
            },
            Olustur: function (o) {
                var that = this;
                if (typeof o !== "object") { var elementId = o; o = { elementId: elementId }; };
                if (Cute.Validation.IsEmpty(o.elementId)) {
                    var newElement = "notification_" + cute.guidMake();
                    $("body").append('<span id="' + newElement + '"></span>')
                    o.elementId = "#" + newElement;
                }

                if (typeof (o.show) == "function") {
                    var _show = o.show;
                    o.show = function (e) {
                        that.Standart.show(e);
                        _show(e);
                    }
                }

                if (typeof (o.hide) == "function") {
                    var _hide = o.hide;
                    o.hide = function (e) {
                        that.Standart.hide(e);
                        _hide(e);
                    }
                }

                var notification = new $(o.elementId).kendoNotification($.extend({}, that.Standart, o)).data("kendoNotification");
                return notification;
            },

            Goster: function (message, messageType) {
                var $divNotification = $("#divNotification").length > 0 ? $("#divNotification") : $('<span id="divNotification"></span>').appendTo('body');
                var notif = this.Olustur({ elementId: $divNotification });
                notif.show({ message: message }, messageType);
            }
        },

        NumericTextBox: {
            Standart: {
                min: 0,
                format: "#",
                decimals: 0
            },
            Olustur: function (o) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId }; };
                var numericTextBox = new $(o.elementId).kendoNumericTextBox($.extend({}, this.Standart, o)).data("kendoNumericTextBox");
                return numericTextBox;
            }

        },

        // <summary>
        // Kendo PanelBar hazırlanması işlemleri (volkansendag - 2013.09.05)
        // </summary>
        PanelBar: {

            Standart: {
                animation: { open: { effects: false } },
                select: function (e) {
                    var item = $(e.item),
                        panelElement = item.closest(".k-panelbar"),
                        dataItem = this.options.dataSource,
                        index = item.parentsUntil(panelElement, ".k-item").map(function () {
                            return $(this).index();
                        }).get().reverse();

                    index.push(item.index());

                    for (var i = -1, len = index.length; ++i < len;) {
                        dataItem = dataItem[index[i]];
                        dataItem = i < len - 1 ? dataItem.items : dataItem;
                    }
                    if (dataItem && dataItem.spriteCssClass && !Cute.Validation.IsEmpty(dataItem.spriteCssClass)) {
                        dataItem.baslik = dataItem.baslik = '<span class="k-sprite ' + dataItem.spriteCssClass + '"></span>' + dataItem.text
                    }

                    dataItem ? (typeof dataItem.onSelect === 'function' ? dataItem.onSelect(e, dataItem) : !0) : !0;
                    dataItem ? (dataItem.tabUrl ? Cute.Kendo.Tab.FormGoster(dataItem.tabUrl, dataItem.baslik ? dataItem.baslik : dataItem.text) : !0) : !0;
                },
            },

            // <summary>
            // Kendo PanelBar oluşturma fonksiyonu. (volkansendag - 2014.01.02)
            // </summary>
            Olustur: function (o, d) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId, menuData: d }; };
                var dataSource = Cute.Kendo.Menu.EntityOlustur(o.menuData)
                menu = $(o.elementId).kendoPanelBar($.extend({}, Cute.Kendo.PanelBar.Standart, {
                    dataSource: dataSource,
                    //select: Cute.Kendo.PanelBar.OnSelect
                }, o)).data("kendoPanelBar");
                return menu;
            },
            Functions: [
				{
				    name: "kurumBilgisiDuzenle",
				    func: function (o) {
				        Cute.AjaxPost({
				            Url: "Services/KurumService.asmx/BilgiGetir",
				            Success: function (o) { // Kayıt getirme işlemi tamamlandıktan sonra yapılacak işlemler.
				                Cute.Kendo.Window.Yeni({
				                    Baslik: "Kurum Bilgi Değişikliği Formu",
				                    Data: $.extend({
				                        "Adi": "",
				                        "Adres": "",
				                        "Telefon": "",
				                        "Faks": "",
				                        "Eposta": "",
				                        "WebSite": ""
				                    }, o.Result.Value),
				                    Template: "KurumBilgiDuzenlemeFormu",
				                    activate: function (e) {
				                        var div = e.sender ? e.sender.element : false;
				                        if (div) {
				                            div.find('.kaydet').bind('click', function () {
				                                var v = div.find("#Kurum_popup_editor").kendoValidator().data("kendoValidator");
				                                if (v.validate()) {
				                                    Data = $.extend({}, Cute.SerializeObject(div.find("#Kurum_popup_editor").find("input,textarea").serializeArray()));
				                                    Cute.AjaxPost({
				                                        Url: "Services/KurumService.asmx/Guncelle",
				                                        Data: Data,
				                                        Success: function (r) {
				                                            Cute.Kendo.Window.Kapat(div);
				                                            Cute.Config.Kurum = $.extend({}, Data)
				                                        }
				                                    });
				                                } else {
				                                    div.find("#Kurum_popup_editor").width(600);
				                                }
				                            });
				                            div.find('.iptal').bind('click', function () {
				                                Cute.Kendo.Window.Kapat(div)
				                            });
				                        }
				                    }
				                });
				            }
				        });

				    }
				},
				{
				    name: "kurumBilgisiDuzenle",
				    func: function (o) {
				    }
				},
                {
                    name: "Logout",
                    func: function (o) {
                        location.href = "Logout.aspx"
                    }
                }
            ],

            // <summary>
            // Kendo PanelBar seçilme fonksiyonu tanımlanması. (volkansendag - 2013.08.20)
            // </summary>
            OnSelect: function (e) {
                var item = $(e.item),
					menuElement = item.closest(".k-menu"),
					dataItem = this.options.dataSource,
					index = item.parentsUntil(menuElement, ".k-item").map(function () {
					    return $(this).index();
					}).get().reverse();

                index.push(item.index());

                for (var i = -1, len = index.length; ++i < len;) {
                    dataItem = dataItem[index[i]];
                    dataItem = i < len - 1 ? dataItem.items : dataItem;
                }

                if (dataItem) {
                    if (dataItem.tabUrl) {
                        Cute.Kendo.Tab.FormGoster(dataItem.tabUrl, (dataItem.tabTitle ? dataItem.tabTitle : dataItem.text ? dataItem.text : 'İsimsiz'));
                    }
                    if (dataItem.exec) {
                        var F = new Function(dataItem.exec);
                        return (F());
                    }
                }

            },
            Kontrol: function (o) {
                typeof o !== "object" ? o = {} : !0;
                o.elementId ? !0 : o.elementId = "#SolPanelBar";
                o.Item ? !0 : o.Item = "span:contains('Onaylanacaklar')";
                o.DefaultText ? !0 : o.DefaultText = "Onaylanacaklar";

                if (o.Value > 0) {
                    var styles = {
                        fontWeight: "bold"
                    };
                    $(o.elementId).find(o.Item).css(styles);
                    $(o.elementId).find(o.Item).text(o.DefaultText + " (" + o.Value + ")");
                } else {
                    $(o.elementId).find(o.Item).removeAttr('style');
                    $(o.elementId).find(o.Item).text(o.DefaultText);
                }
            }
        },

        // <summary>
        // Kendo TabStript hazırlanması işlemleri (volkansendag - 2013.09.05)
        // </summary>
        Tab: {
            CloseIcon: '<img style="padding-left: 10px; z-index: 1111; height:8px; width:8px;" onclick="Cute.Kendo.Tab.FormSil(this);" src="data:image/gif;base64,R0lGODlhDQAMAKIAAAAAAP///4+xzLjR5nJycmZmZgAAAAAAACwAAAAADQAMAEADHki6zBHqQfJipXbKvfOkksddI2dlJ3ipGomyZSMvCQA7" />',
            Standart: {
                Liste: [],
                animation: false,
                activate: function (e) {
                    e.sender.options._Active ? e.sender.options._Active(e) : !0;
                    // İçerisinde Kendo Grid mevcut Tab'ların aktive edilmesi durumunda Grid boyutu gözden geçirilip yeniden oluşturuluyor.
                    $(e.contentElement).find("div[data-role='grid']").each(function () {
                        Cute.Kendo.Grid.BoyutDuzenle(this);
                    });
                },
                contentLoad: function (e, f) {
                    var contentData = $(e.item).data("tab-options");
                    Cute.AjaxProcessor.Loading({ Islem: false });
                    contentData && typeof contentData.afterLoad == 'function' ? contentData.afterLoad(this, e) : !0;

                    if (e.sender.options.controllers) {

                        var controllerElement = $(e.contentElement).find('[data-controller]')
                        if (controllerElement.length == 1) {
                            var controllerName = controllerElement.data('controller');
                            var controller = e.sender.options.controllers[controllerName];
                            if (typeof controller == "function") {
                                e.contentData = contentData;
                                controller(e);
                            }
                        }
                    }
                },
                error: function (e) {
                    Cute.AjaxProcessor.Loading({ Islem: false });
                    Cute.Mesaj.Goster({
                        title: "Olmadı.",
                        mesaj: "Bi daha..."
                    })
                }
            },

            // <summary>
            // Kendo Tab oluşturma işlemi . (volkansendag - 2013.08.20)
            // </summary>
            Olustur: function (o) {
                if (typeof o !== "object") { u = o; o = { elementId: u }; };
                var self = this;
                o.activate ? (o._Active = o.activate, o.activate = this.Standart.activate) : !0;
                if (typeof o.contentLoad == "function") {
                    var tempF = o.contentLoad;
                    o.contentLoad = function (e, f) {
                        self.Standart.contentLoad(e, f);
                        tempF(e, f);
                    }
                }
                return $(o.elementId).kendoTabStrip($.extend({}, this.Standart, o)).data("kendoTabStrip");
            },

            // <summary>
            // Kendo Tab üzerinde form gösterme işlemi (volkansendag - 2013.07.01)
            // </summary>
            FormGoster: function (o, title, elementId) {
                var options, url;
                if (typeof o !== "object") {
                    url = o;
                    options = $.extend({}, {
                        url: url,
                        elementId: elementId ? elementId : "#tabstrip",
                        title: title
                    });
                } else {
                    options = o;
                };
                var tabStrip = $(options.elementId ? options.elementId : "#tabstrip").data("kendoTabStrip");
                var tabMevcut = false;
                var Count = 0;

                $.each(tabStrip.options.Liste, function (key, value) {
                    if (value ? ((value.url ? value.url : value) == options.url) : false) {
                        tabStrip.select(key);
                        options.afterLoad ? (typeof options.afterLoad == "function" ? options.afterLoad(tabStrip, { tabMevcut: true }) : !0) : !0;
                        tabMevcut = true;
                    }
                    Count++;
                });

                if (!tabMevcut) {
                    Cute.AjaxProcessor.Loading({ Islem: true });
                    tabStrip.append({
                        text: options.title + this.CloseIcon,
                        encoded: false,
                        contentUrl: options.url
                    });
                    var son = $(tabStrip.items()).last();
                    if (options.afterLoad && typeof options.afterLoad == "function") {
                        var tempFunc = options.afterLoad;
                        options.afterLoad = { afterLoad: function (e) { tempFunc(e, { tabMevcut: false }); } };
                    }

                    son.data("tab-options", options);

                    tabStrip.select(Count);
                }
                tabStrip.options.Liste = [];
                $.each(tabStrip.tabGroup[0].childNodes, function (index, obj) {
                    tabStrip.options.Liste.push({
                        url: $(obj).find('span.k-link').attr("data-content-url")
                    });
                });
            },


            // <summary>
            // Nesnenin üzerinde bulunduğu Tab numarasını döner. (volkansendag - 2013.08.20)
            // </summary>
            ItemTabNo: function (i) {
                if ($(i).closest('div[role="tabpanel"]').index() > -1) return $(i).closest('div[role="tabpanel"]').index() - 1;
                return $(i).closest("li").index();
            },

            // <summary>
            // Nesnenin üzerinde bulunduğu Tab'ın seçilmesi sağlanır. (volkansendag - 2013.08.20)
            // </summary>
            ItemTabSec: function (i) {
                tabId = "#tabstrip";
                $(tabId).data("kendoTabStrip").select(this.ItemTabNo(i));
            },

            // <summary>
            // Nesnenin üzerinde bulunduğu Tab numarasını döner. (volkansendag - 2013.08.20)
            // </summary>
            BaslikDegistir: function (o, n, t) {
                if (typeof o !== "object") { o = { TabNo: o, Baslik: n, TabId: "#tabstrip" } };
                tabId = o.TabId ? o.TabId : "#tabstrip";
                tabS = $(tabId).find('ul.k-tabstrip-items').children("li").eq(o.TabNo).find(".k-link");
                tabS.html(o.Baslik + this.CloseIcon);
            },

            // <summary>
            // Kendo Tab üzerinde form silme işlemi (volkansendag - 2013.07.01)
            // </summary>
            FormSil: function (tabNo, elementId) {
                o = {
                    tabNo: tabNo,
                    elementId: elementId ? elementId : "#tabstrip"
                }

                var tabStrip = $(o.elementId).data("kendoTabStrip"), tabNo;
                Cute.Validation.Numeric(o.tabNo) ? tabNo = o.tabNo : tabNo = this.ItemTabNo(o.tabNo);

                if ($(tabStrip.contentElements[tabNo]).find('[data-Degistimi="true"]').length > 0) {
                    var c = confirm("Form üzerinde değişiklikler mevcut. İşleme devam etmek istediğinizden emin misiniz?")
                    if (!c) {
                        tabStrip.select(tabNo);
                        return false;
                    }
                }
                tabStrip.remove(tabNo), tabStrip.select(tabNo - 1), tabStrip.options.Liste = [];
                $.each(tabStrip.tabGroup[0].childNodes, function (index) {
                    tabStrip.options.Liste[index] = $(this).find('span.k-link').attr("data-content-url");
                });
            }
        },

        Tree: {
            Standart: {
                messages: {
                    requestFailed: "Yükleme hatası.",
                    retry: "Yenile"
                }
            },
            Olustur: function (o) {
                if (typeof o !== "object") { elementId = o; o = { elementId: elementId }; };
                var _tree = $(o.elementId).kendoTreeView($.extend({}, this.Standart, o)).data("kendoTreeView");
                return _tree;
            }
        },

        // <summary>
        // Kendo Upload hazırlanması işlemleri. (volkansendag - 2013.08.20)
        // </summary>
        Upload: {
            Standart: {
                senkronData: [],
                complete: function (e) {
                    Cute.AjaxProcessor.Loading({ Islem: false });
                },
                remove: function (e) {
                    Cute.AjaxProcessor.Loading({ Islem: true });
                },
                error: function (e) {
                    Cute.AjaxProcessor.Loading({ Islem: false });
                    response = Cute.Xml2Obj(e.XMLHttpRequest.response)
                },
                success: function (e) {
                    var srValue = e.response.srValue;

                    if (srValue) { // İşlem "dosya ekleme" işlemidir.
                        if (srValue.Error !== true && srValue.Error !== "true") {
                            e.files[0].Id = srValue.Value;
                            e.sender.options.files.push(e.files[0]);
                        } else {
                            Cute.Mesaj.Goster({
                                title: "Dosya Yüklenemedi!",
                                mesaj: srValue.Message
                            });
                            e.uploadElement ? e.uploadElement.removeClass("k-file-success").addClass("k-file-error").fadeOut(1000, function () { e.uploadElement.remove(); }) : !0;
                        }
                    } else {// İşlem "dosya silme" işlemidir.
                        Silinmisler = $.grep(e.sender.options.files, function (n, i) {
                            return n.Id == e.files[0].Id;
                        });
                        if ($.isArray(e.sender.options.Silinmisler)) {
                            e.sender.options.Silinmisler.push(Silinmisler[0])
                        } else {
                            e.sender.options.Silinmisler = Silinmisler
                        }
                        e.sender.options.files = $.grep(e.sender.options.files, function (n, i) {
                            return n.Id == e.files[0].Id;
                        }, true)
                    }
                    $(".degisenform[type='file']").trigger("change");
                    e.uploadElement.find("h4.file-heading").removeAttr("onclick").attr("onclick", "cute.dosyaGoster(" + e.files[0].Id + ", this)");
                    e.uploadElement.find("div.dosyaSilButton").removeAttr("onclick").attr("onclick", "cute.dosyaSil(this, " + e.files[0].Id + ")");
                },
                upload: function (e) {
                    Cute.AjaxProcessor.Loading({ Islem: true });
                    e.data = { Name: encodeURI(e.files[0].name), Type: e.files[0] ? e.files[0].rawFile ? e.files[0].rawFile.type : "" : "" };
                },
                template: "<span class='k-progress'></span> "
					+ "<div class='file-wrapper' >"
					+ "    <span class='file-icon #=cute.dosyaTipi(files[0].name)#'></span>"
					+ "    <h4 onclick='cute.dosyaGoster(#=files[0].Id #, this )' style='cursor: pointer;' class='file-heading file-name-heading'>Dosya Adı: #=name#</h4>"
				//+ "    <button type='button' class='k-button' style='padding-right: 20px; padding-left: 20px; float: right;'>Sil</button>"
					+ "    <div onclick='cute.dosyaSil(this, #=files[0].Id # )' class='dosyaSilButton' style='float: right; margin-top:5px;margin-right:15px;cursor: pointer;'><span class='k-icon k-delete'></span>Sil</div>"
					+ "</div>"
            },
            Olustur: function (o) {
                if (typeof o !== "object") { u = o; o = { elementId: u }; };
                input = $(o.elementId);
                input_html = input.clone().wrap('<p>').parent().html()
                input.data("kendoUpload") ? input.data("kendoUpload").destroy() : !0;
                upload_div = input.closest("div.k-upload")
                $(input_html).insertAfter(upload_div)
                upload_div.remove();
                o.async = {
                    saveUrl: Cute.Config.Url.DosyaEkleService,
                    //removeUrl: Cute.Config.Url.DosyaSilService,
                    autoUpload: true
                },
				upload = $(o.elementId).kendoUpload($.extend({}, this.Standart, o)).data("kendoUpload");
                $(o.elementId).change(function () {
                    Cute.Form.Degisti($(o.elementId).closest("div.k-upload"));
                });

                o.readOnly ? ($(o.elementId).closest(".upload-form").find(".k-dropzone,.dosyaSilButton").remove()) : !0;
                upload ? upload.options ? upload.options.senkronData = [] : !0 : !0;
                return upload;
            },
            DosyalariOku: function (o) {
                if (typeof o !== "object") { u = o; o = { elementId: u }; };
                Cute.AjaxPost({
                    Url: "Services/BelgeBelgeEkService.asmx/ListeleByBelgeId",
                    Data: o.Data,
                    Success: function (r) {
                        var d = r.Result.Values;
                        var values = [];
                        $.each(d, function (index, value) {
                            objFile = { name: value.DosyaAdi, Id: value.BelgeEkId, size: 525, extension: ".doc" };
                            objFile[o.dataKeyField] = value.BelgeBelgeEkId;
                            values.push(objFile);
                        });
                        return Cute.Kendo.Upload.Olustur($.extend({}, o, { files: values, ilkVeriler: values }));
                    }
                });
            },
            SenkronizeEt: function (o) {
                if (typeof o !== "object") { obj = o; o = { elementId: obj }; };
                var uploadData = $(o.elementId).data("kendoUpload");

                Eklenenler = $.grep(uploadData.options.files, function (n, i) {
                    return (n[uploadData.options.dataKeyField] == undefined || n[o.dataKeyField] < 1)
                });


                if (uploadData.options.insertUrl) {
                    $.each(uploadData.options.files, function (i, v) {
                        if (v !== undefined) {
                            if (v[uploadData.options.dataKeyField] == undefined || v[uploadData.options.dataKeyField] < 1) {
                                data = uploadData.options.insertData;
                                data[uploadData.options.insertKeyField] = v.Id;
                                Cute.AjaxPost({
                                    Url: uploadData.options.insertUrl,
                                    Data: data,
                                    SonucuBekleme: true,
                                    Success: function (o) {
                                        var d = o.Result.Value;
                                        v[uploadData.options.dataKeyField] = d
                                    }
                                });
                            }
                        }
                    });
                };

                if ((uploadData.options.deleteUrl) && $.isArray(uploadData.options.Silinmisler)) {
                    $.each(uploadData.options.Silinmisler, function (i, v) {
                        if (v !== undefined) {
                            if (v[uploadData.options.dataKeyField] !== undefined || v[uploadData.options.dataKeyField] > 1) {
                                Cute.AjaxPost({
                                    Url: uploadData.options.deleteUrl,
                                    Data: { Id: v[uploadData.options.dataKeyField] },
                                    SonucuBekleme: true,
                                });
                            }
                        }
                    });

                };
                uploadData.options.Silinmisler = [];
            },
            SenkronizeData: function (o) {
                if (typeof o !== "object") { obj = o; o = { elementId: obj }; };
                var uploadData = $(o.elementId).data("kendoUpload");

                Eklenenler = $.grep(uploadData.options.files, function (n, i) {
                    return (n[uploadData.options.dataKeyField] == undefined || n[o.dataKeyField] < 1)
                });

                $.each(uploadData.options.files, function (i, v) {
                    if (v !== undefined) {
                        if (v[uploadData.options.dataKeyField] == undefined || v[uploadData.options.dataKeyField] < 1) {
                            var data = $.extend({}, uploadData.options.insertData);
                            data[uploadData.options.insertKeyField] = v.Id;
                            data.DosyaAdi = v.name;
                            uploadData.options.senkronData.push(data);
                        }
                    }
                });

                if ($.isArray(uploadData.options.Silinmisler)) {
                    $.each(uploadData.options.Silinmisler, function (i, v) {
                        if (v !== undefined) {
                            if (v[uploadData.options.dataKeyField] !== undefined || v[uploadData.options.dataKeyField] > 1) {
                                data = {};
                                data[uploadData.options.dataKeyField] = v[uploadData.options.dataKeyField]
                                uploadData.options.senkronData.push(data);
                            }
                        }
                    });

                };
                uploadData.options.Silinmisler = [];
            }
        },


        // <summary>
        // Kendo Validation hazırlanması işlemleri. (volkansendag - 2013.08.20)
        // </summary>
        Validation: {
            Templates: {
                SpanRight: '<span class="k-widget k-tooltip k-tooltip-validation k-invalid-msg" style="text-align: left;" ><span class="k-icon k-warning" ></span>#=message#</span>',
                DivPopup: '<div class="k-widget k-tooltip k-tooltip-validation" style="margin:0.5em"><span class="k-icon k-warning"> </span>#=message#<div class="k-callout k-callout-n"></div></div>'
            },
            Standart: {
                validateOnBlur: false
            },
            // <summary>
            // Kendo Validation oluşturma işlemi . (volkansendag - 2013.08.20)
            // </summary>
            Olustur: function (o) {
                if (typeof o !== "object") { var u = o; o = { elementId: u }; };
                return $(o.elementId).kendoValidator($.extend({}, this.Standart, o)).data("kendoValidator");
            }
        },

        // <summary>
        // Kendo Window hazırlanması işlemleri. (volkansendag - 2013.08.20)
        // </summary>
        Window: {
            Standart: {
                actions: ["Close"],
                modal: true,
                visible: false,
                resizable: false,
                content: null,
                close: function (e) {
                    var win = e.sender;
                    setTimeout(function () {
                        win.destroy();
                    }, 1000)
                }
            },

            // <summary>
            // Nesnenin içinde bulunduğu pençerenin kapatılması işlemi . (volkansendag - 2013.08.20)
            // </summary>
            Kapat: function (o) {
                if (o !== undefined) {
                    $(o).closest('[data-role="window"]').data("kendoWindow") ? $(o).closest('[data-role="window"]').data("kendoWindow").close() : !0;
                }
            },

            // <summary>
            // Yeni pençere açılması işlemi . (volkansendag - 2013.08.20)
            // </summary>
            Yeni: function (o) {
                var windowId = 'KendoWindow_' + Math.floor(Math.random() * 99999999999),
                    that = this;

                var that = this;

                if (typeof o.close == "function") {
                    var _close = o.close;
                    o.close = function (e) {
                        _close(e);
                        that.Standart.close(e);
                    }
                }

                var _open = o.open;
                o.open = function (e) {
                    var $div = e.sender.element;
                    $div.find(".close").click(function () { e.sender.close(); });

                    if (e.sender.options.controllers) {

                        var controllerElement = $div.find('[data-controller]')
                        if (controllerElement.length == 1) {
                            e.contentElement = $div;
                            var controllerName = controllerElement.data('controller');
                            var controller = e.sender.options.controllers[controllerName];
                            if (typeof controller == "function") {
                                controller(e, o);
                            }
                        }
                    }

                    if (o.viewModel) {
                        kendo.bind($div, kendo.observable(o.viewModel));

                        if (typeof o.viewModel.init == "function")
                            o.viewModel.init(e);
                    } else {
                        kendo.init($div);
                    }

                    if (_open && typeof _open == "function") { _open(e); }
                }
                var className = "";
                if (o.wrapperCss) {
                    className = 'class="' + o.wrapperCss + '"';
                }

                $('body').append('<div id="' + windowId + '" ' + className + '></div>');
                o.Baslik ? this.Standart.title = o.Baslik : !0;
                o.elementId ? o.elementId = Cute.Functions.guidMake() : !0;
                var Win = $("#" + windowId).kendoWindow($.extend({}, this.Standart, o)).data("kendoWindow");


                if (o.Template) {
                    var Temp = that.Template(o.Template), templateUrl = "";
                    if (Temp.length > 0) {
                        templateUrl = Cute.Config.Url.Root + Temp[0].url;
                    } else if (!Cute.Validation.IsEmpty(cute.delRight(o.Template, ".html")) && cute.delRight(o.Template, ".html").indexOf(".") >= 0) {
                        templateUrl = cute.delRight(o.Template, ".html").replace(/\./g, "/") + ".html";
                    } else if (!Cute.Validation.IsEmpty(cute.delRight(o.Template, ".html")) && cute.delRight(o.Template, ".html").indexOf("/") >= 0) {
                        templateUrl = cute.delRight(o.Template, ".html") + ".html";
                    }

                    if (!Cute.Validation.IsEmpty(templateUrl)) {
                        templateUrl = templateUrl + "?v=" + Cute.Info.Version;
                        $.get(templateUrl, function (d) {
                            var detailsTemplate = kendo.template(d);
                            Win.content(detailsTemplate((o.Data ? o.Data : {}))).center().open().center();
                        });
                    }
                    return Win;
                } else if (o.Html) {
                    var detailsTemplate = kendo.template((o.Html ? o.Html : "<div></div>"));
                    Win.content(detailsTemplate((o.Data ? o.Data : {})))
                }
                Win.center().open().center();
                if (o.Top) {
                    Win.setOptions({
                        position: $.extend({}, Win.options.position, { top: 100 })
                    });
                }
                return Win;
            },
            Template: function (name) {
                return name && Cute.Templates ? $.grep(Cute.Templates, function (n, i) {
                    return n.name == name || i == name;
                }) : false;
            }
        }
    };

    Cute.Kendo.init();
}