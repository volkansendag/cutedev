var Cute = {
    Init: function () {
        this.stringFunctionInit();
    },
    Info: {
        Name: "SAVAB",
        Version: "1.1.1"
    },
    Config: {
        Url: {
            Login: "Login.aspx",
            Logout: "Logout.aspx",
            Root: "",
            Init: function (u) {
                this.Root = u;
                this.Login = u + this.Login;
                this.Logout = u + this.Logout;
            }
        },
        User: {
            Id: 0,
            Adi: "",
            AdiSoyadi: ""
        },
        Varsayilan: {},
        CookieSettings: {
            govdeAyrac: {
                collapsedLeft: false,
                sizeLeft: 220
            }
        },
        setCookieSettings: function (o) {
            newData = $.extend({}, Cute.Config.CookieSettings, o);
            Cute.Set_Cookie("CuteSettings", cute.stringify(newData), 30);
        },
        getCookieSettings: function (o) {
            cookiData = cute.parseJSON(Cute.Get_Cookie("CuteSettings"));
            Cute.Config.CookieSettings = $.extend({}, Cute.Config.CookieSettings, cookiData);
            return Cute.Config.CookieSettings;
        }
    },

    Enums: {
        AramaYontemi: {
            Manuel: 0,
            Otomatik: 1,
            Anket: 2
        },
        AgentDurumu: {
            Pasif: 0,
            Hazir: 1,
            Molada: 2,
            GorusmeSonrasi: 3,
            ManuelArama: 4
        }
    },

    // <summary>
    // Ajax ile servislere post işlemleri (volkansendag - 2013.07.01)
    // </summary>
    AjaxPost: function (options) {
        if (!$.isPlainObject(options)) { return false; }
        var self = this;
        var defaults = {
            Loading: true
        };

        var o = $.extend(defaults, options);

        if (!self.AjaxProcessor.IslemVarmi(o)) {
            self.AjaxProcessor.IslemEkle(o);
            var _data = o.data ? cute.stringify(o.data) : cute.stringify(o.Data ? o.Data : {});
            $.ajax(
                            {
                                url: o.Url,
                                type: o.Method ? o.Method : 'POST',
                                data: _data,
                                contentType: o.Content ? o.Content : "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (response) {
                                    o.Result = response.d ? response.d : response;

                                    if (response == null) {
                                        if (typeof o.Error === 'function') { o.Error(o); }
                                        if (o.Alert !== false) {
                                            self.Mesaj.Goster({ mesaj: self.Exceptions().Description, title: self.Exceptions().Title });
                                        };
                                        return;
                                    }

                                    if (response.Error == true) {
                                        if (response.MessageCode == "Session") {
                                            if (typeof o.Error === 'function') { o.Error(o); }
                                            if ($('.loginPopup').length > 0) {
                                                $('.loginPopup').toggleClass('active');
                                                return false;
                                            }
                                        }
                                        if (o.Alert !== false) {
                                            self.Mesaj.Goster({ mesaj: response.Message, title: self.Exceptions(response.MessageCode).Title });
                                            if (typeof o.Error === 'function') { o.Error(o); }
                                        }

                                        return false;
                                    }

                                    if (typeof o.Success === 'function') {
                                        try {
                                            o.Success(o);
                                        } catch (e) {
                                            alert(e.message);
                                        }
                                    }
                                },
                                complete: function (data) {
                                    self.AjaxProcessor.IslemSil(o);
                                    if (typeof o.Complete === 'function') {
                                        o.Complete(o);
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    var mesaj, errObj, code = "SunucuHatasi";
                                    try {
                                        errObj = jQuery.parseJSON(jqXHR.responseText)
                                        mesaj = errObj.Message;
                                        code = errObj.MessageCode;
                                    } catch (e) {
                                        errObj = jqXHR;
                                        mesaj = 'Hata Kodu: ' + textStatus
                                                + '<br />Mesaj :' + errorThrown
                                    }

                                    o.Result = errObj;

                                    if (typeof o.Error === 'function') {
                                        try {
                                            o.Error(o);
                                        } catch (e) {
                                            self.Mesaj.Goster({
                                                title: "JavaScript Hatası - Error",
                                                mesaj: e.message
                                            })
                                        }
                                    }
                                    if (o.Alert !== false) {
                                        self.Mesaj.Goster({
                                            mesaj: mesaj,
                                            title: self.Exceptions(code).Title
                                        });
                                    }

                                }
                            });
        }
    },

    // <summary>
    // Mesaj gösterme işlemi (volkansendag - 2013.07.01)
    // </summary>
    Mesaj: {
        Standart: {
            MesajTuru: 0,
            Name: "Tamam",
            ButtonStyle: "float: right; margin-right: 10px;",
            Data: function () {
                return {
                    title: Cute.Info.Name,
                    mesaj: "Örnek uyarı mesajı",
                    width: 350
                }
            },
            //Html: '<div class="cute-alert">#if (data.title){ #<h1>#= title #</h1> # } #<p>#= mesaj #</p><div class="buttons">#=Buttons#</div></div>',
            //ButtonHtml: '<button style="#=Style#" class="k-button #=Id#" >#=Name#</button>',
            Html: '<div class="cute-alert"><p>#= mesaj #</p><div class="buttons">#=Buttons#</div></div>',
            ButtonHtml: '<button style="#=Style#" class="k-button #=Id#" >#=Name#</button>'
        },
        Turler: [{
            TurAdi: "default",
            Buttons: [{
                Id: "DefaultButton",
                Name: "Tamam",
                Focus: true,
                Click: function (e, t) {
                    e.Kapat(t.target)
                }
            }]
        }, {
            TurAdi: "onay",
            Buttons: [{
                Name: "İptal",
                Click: function (f, t) {
                    f.Kapat(t.target);
                }
            }, {
                Id: "onayButton",
                Name: "Tamam",
                ButtonStyle: "test",
                Focus: true
            }]
        }],
        Goster: function (s) {
            var o = { Tip: "default" };
            if (s) {
                if (typeof s == "string") {
                    $.extend(o, { mesaj: s })
                } else {
                    $.extend(o, s);
                }
            }

            if (!window.kendo) {
                o.mesaj = o.mesaj.replace("<br />", "\n");
                alert(o.mesaj);
                return false;
            }

            var arr = this.Turler,
                turArray = $.grep(arr, function (n, v) { return n.TurAdi == o.Tip; }),
                tur = turArray[0],
                windowMesajData = $.extend(true, {}, this.Standart.Data(), tur, o),
                html = this._htmlHazirla(windowMesajData);
            html = html.replace(/\\/g, "\\\\")


            var msgWindow = Cute.Kendo.Window.Yeni($.extend({}, windowMesajData, {
                activate: function (e) {
                    var thatWindow = this
                    $.each(windowMesajData._Buttons, function (i, v) {
                        thatWindow.element.find("." + v.Id).bind("click", function (t) {
                            e.Kapat = function (element) {
                                Cute.Kendo.Window.Kapat(element);
                            }
                            if (typeof v.Click === "function")
                                v.Click(e, t)
                        });
                        if (v.Focus) { thatWindow.element.find("." + v.Id).focus(); }
                    });
                },
                Html: html
            }));

            return msgWindow;
        },
        _htmlHazirla: function (m) {
            m._Buttons = m.Buttons;
            m ? (m.Buttons = this._buttonHazirla(m)) : m = $.extend({}, m, { Buttons: this._buttonHazirla(m) });
            var t = kendo.template(m.Html ? m.Html : this.Standart.Html),
                html = t(m);
            return html;
        },
        _buttonHazirla: function (o) {
            var that = this,
                html = "";

            $.each(o._Buttons, function (i, v) {
                v.Id ? !0 : v.Id = Cute.Functions.guidMake();
                var t = kendo.template(v.Html ? v.Html : that.Standart.ButtonHtml),
                    h = t({ Name: v.Name ? v.Name : that.Standart.Name, Id: v.Id, Style: v.Style ? v.Style : that.Standart.ButtonStyle });

                html += h;
            })
            return html
        }
    },

    // <summary>
    // Form datasının Object Data'ya dönüştürülmesi işlemi (volkansendag - 2013.07.01)
    // </summary>
    SerializeObject: function (a) {
        var o = {};
        /* Because serializeArray() ignores unset checkboxes and radio buttons: */
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    },

    FormData: function (o) {
        var chks = $(o).find('input[type=checkbox]:not(:checked)').map(function () { return { "name": this.name, "value": "false" } }).get();
        return Cute.SerializeObject($(o).find("input,textarea,select").serializeArray().concat(chks));
    },

    FormFillData: function (form, data) {
        $(form).find("input,textarea,select").each(function (i, v) {
            var inputName = $(v).attr("name");
            if (data && data[inputName])
                $(v).val(data[inputName]);
        });
    },

    // <summary>
    // ENTER tuşuna TAB tuşu özelliği verme işlemi (volkansendag - 2013.07.04)
    // f: hangi css classına sahip olanlar üzerinde dolaşılacağını belirtmektedir.
    // t: enter ile geçiş işleminin hangi noktada sonlanacağını belirtmektedir.
    // </summary>
    EnterTabInputs: function (f, t, isable) {
        if (isable == false) {
            var focusables = $(f);
        } else {
            var focusables = $(f);
            //var focusables = $(f).find(":focusable");
        }
        focusables.bind("keydown", function (e) {
            if (e.keyCode == 13) {
                if ($(e.target).context.classList !== undefined) {
                    if ($(e.target).context.classList.contains(t) || e.target.localName == "button" || e.shiftKey == true) {
                        $(e.target).trigger('click');
                        return false;
                    } else {
                        var current = focusables.index(this)
                        if (e.ctrlKey == true) {
                            var next = focusables.eq(current + 1).length ? focusables.eq(current - 1) : focusables.eq(0);
                        } else {
                            var next = focusables.eq(current + 1).length ? focusables.eq(current + 1) : focusables.eq(0);
                        }
                        next.focus();
                        return false;
                    }
                }
            }
        });
        //setTimeout(function () { focusables.first().focus(); }, 500);
    },

    // <summary>
    // Uyarı mesajlarını içeren nesne (volkansendag - 2013.07.01)
    // </summary>
    Exceptions: function (o) {
        var t = this;

        DefaultExeption = {
            Title: "Sunucu Erişim Hatası",
            Description: "Sunucuya erişim sırasında hata oluştu."
        }

        if (t.Validation.IsEmpty(o)) { return DefaultExeption };

        var List = [{
            Code: "Invoke",
            Name: "IslemHatasi",
            Title: "İşlem Hatası!",
            Description: "İşleminiz gerçekleştirilemedi!"
        }, {
            Code: "E1",
            Name: "IslemHatasi",
            Title: "İşlem Hatası!",
            Description: "İşleminiz gerçekleştirilemedi!"
        },
        {
            Code: "Parameter",
            Name: "ParametreHatasi",
            Title: "Parametre Hatası!",
            Description: "Eksik ya da hatalı parametre girdiniz!"
        },
        {
            Code: "Session",
            Name: "OturumHatasi",
            Title: "Oturum Hatası!",
            Description: "İşleminizin gerçekleştirilebilmesi için geçerli bir oturum bulunamadı!"
        },
        {
            Code: "Exist",
            Name: "Exist",
            Title: "Tekrarlı Kayıt Hatası",
            Description: "İşlem yapmak istediğiniz kayıt daha önceden sisteme eklenmiştir!!"
        }];

        kodSearch = $.grep(List, function (a) { return a.Code == o; });
        if (kodSearch.length > 0) {
            return kodSearch[0];
        } else {
            nameSearch = $.grep(List, function (a) { return a.Name == o; });
            if (nameSearch.length > 0) {
                return nameSearch[0];
            } else {
                return DefaultExeption;
            }
        }
    },

    // <summary>
    // true için "Var" false için "Yok" döndürür. (volkansendag - 2013.07.24)
    // </summary>
    BooleanTR: function (x) {
        if (x == "true" || x == true) {
            return "Var"
        } else {
            return "Yok"
        }
    },

    // <summary>
    // Görünüm değişikliklerini Cookie olarak kaydeder. Cookie'de kayıtlı görünümü sayfaya yükler. (volkansendag - 2013.07.24)
    // </summary>
    Style: {
        style_cookie_name: "style",
        style_cookie_duration: 30,
        switch_style: function (css_title) {
            var i, link_tag;
            for (i = 0, link_tag = document.getElementsByTagName("link") ;
              i < link_tag.length ; i++) {
                if ((link_tag[i].rel.indexOf("stylesheet") != -1) &&
                  link_tag[i].title) {
                    link_tag[i].disabled = true;
                    if (link_tag[i].title == css_title) {
                        link_tag[i].disabled = false;
                    }
                }
                Cute.Set_Cookie(this.style_cookie_name, css_title, this.style_cookie_duration);
            }
        },
        set_style_from_cookie: function () {
            var css_title = Cute.Get_Cookie(this.style_cookie_name);
            if (css_title.length) {
                this.switch_style(css_title);
            }
        }
    },

    // <summary>
    // Cookie'ye kayıt ekler. (volkansendag - 2013.07.24)
    // </summary>
    Set_Cookie: function (cookie_name, cookie_value, lifespan_in_days, valid_domain) {
        var domain_string = valid_domain ? ("; domain=" + valid_domain) : '';
        document.cookie = cookie_name +
                           "=" + encodeURIComponent(cookie_value) +
                           "; max-age=" + 60 * 60 *
                           24 * lifespan_in_days +
                           "; path=/" + domain_string;
    },

    // <summary>
    // Cookie'den kayıt okur. (volkansendag - 2013.07.24)
    // </summary>
    Get_Cookie: function (cookie_name) {
        if (document.cookie.length > 0)//checks for the availability of cookie name
        {
            var c_start = document.cookie.indexOf(cookie_name + "=");
            if (c_start != -1) {
                c_start = c_start + cookie_name.length + 1;
                var c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return decodeURIComponent(document.cookie.substring(c_start, c_end));//returns the cookie after decoding
            }
        }
        return "";
    },

    // <summary>
    // Kullanıcı oturumu ile ilgili işlemleri yapar. (volkansendag - 2013.07.30)
    // </summary>
    Oturum: {
        Durum: true,
        // <summary>
        // Kullanıcı oturumunun kaç saniyede bir kontrol edileceği bilgisi. (volkansendag - 2013.07.30)
        // </summary>
        DenemeSuresiSaniye: 130,

        BilgiKontrolDenemeSayisi: 0
    },

    // <summary>
    // Veri doğrulama işlemleri (volkansendag - 2013.07.01)
    // </summary>
    Validation: {
        Numeric: function (val) {
            if (isNaN(val) == true || val == null || val.toString().replace(" ", "") == "" || val.toString().replace("\t", "") == "" || val.toString().replace("\n", "") == "") { return 0; }
            return val;
        },
        IsEmpty: function (val) {
            if (val == null || val.toString().replace(" ", "") == "" || val.toString().replace("\t", "") == "" || val.toString().replace("\n", "") == "") { return true; }
            return false;
        },
        IsEmail: function (val) {
            var regexp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            return regexp.test(val);
        },
        IsDate: function (yyyy, mm, dd) {
            var dt = new Date(yyyy, mm - 1, dd);
            if (dt.getFullYear() != yyyy || dt.getMonth() != mm - 1 || dt.getDate() != dd) { return false; }
            return true;
        },
        IsUrl: function (val) {
            var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
            return regexp.test(val);
        }
    },


    // <summary>
    // Ajax ile yapılan işlemlerin listeleme işlemleri (volkansendag - 2013.07.08)
    // </summary>
    AjaxProcessor: {
        Liste: [],
        Overlay: "<div id='LoadingDiv' style='z-index: 990090;'>" +
                "</div>",
        OverlayProcess: "<div id='OverlayProcess' style='z-index: 900929999;'>" +
                "</div>",
        Message: "<div id='LoadingOverlayIcon' class='k-loading-mask'>" +
                        "<span class='k-loading-text' style='left: 50%; position: absolute; top: 5px;'></span>" +
                        "<div class='k-loading-image' style='z-index: 990091;'></div>" +
                    "</div>",
        loading: function (loading, message) {
            var t = this;

            if (loading !== false) {
                if ($("#OverlayProcess").length == 0) {
                    $("body").append(t.OverlayProcess);
                    if (message) {
                        $("#OverlayProcess").append(t.Message);
                    }
                }
            } else {
                setTimeout(function () {
                    $("body div#OverlayProcess").remove();
                }, 4);
            }
        },
        Loading: function (o) {
            var t = this;

            var showLoading = function (goster) {
                if (window.kendo) {
                    kendo.ui.progress($("body"), !!goster);
                    return false;
                }

                if (goster && $("#LoadingDiv").length == 0) {
                    $("body").append(t.Overlay);
                    $("#LoadingDiv").append(t.Message);
                }

                if (!goster) {
                    setTimeout(function () {
                        arr = jQuery.grep(Cute.AjaxProcessor.Liste, function (v) {
                            return v.Loading == false;
                        }, true);
                        arr.length > 0 ? !0 : $("div#LoadingDiv").remove();
                    }, 5);
                }
            }

            if (typeof o == "boolean") {
                showLoading(o);
            } else if (typeof o == "object" && o.Loading) {
                o = $.extend({ Islem: true }, o);
                if (o.Islem) {
                    showLoading(true);
                } else {
                    showLoading(false);
                }
            }
        },
        IslemVarmi: function (o) {
            var t = this;
            if (o.SonucuBekleme) { return false; }
            arr = jQuery.grep(t.Liste, function (val) {
                return val.IslemId == t.IslemId(o);
            });
            if (arr.length > 0) {
                cute.console("İşlem devam ediyor.")
                return true;
            }
        },
        IslemEkle: function (o) {
            o.Islem = true;
            var t = this;
            t.Loading(o);
            if (!t.IslemVarmi(o)) {
                t.Liste.push({ Loading: o.Loading, IslemId: t.IslemId(o) });
            }
        },
        IslemSil: function (o) {
            var t = this;
            t.Liste = jQuery.grep(t.Liste, function (val) {
                return val.IslemId == t.IslemId(o);
            }, true);
            o.Islem = false;
            t.Loading(o);
        },
        IslemId: function (o) {
            var Data = (o.Data ? o.Data : "Null");
            return cute.stringify(o.Url) + '&' + cute.stringify(Data).substring(0, 100);
        }
    },

    // <summary>
    // Görevlerin zamanlanarak yenilenmesi edilmesi. (volkansendag - 2013.09.04)
    // </summary>
    GorevYonetimi: {
        Gorevler: [{
            IslemAdi: "OturumYenile",
            Parametreler: {},
            Islem: function () {
                var thatFuncObj = this,
                    _data = {},
                    prjCombobox = $("input.ProjeSelectInput").data("kendoDropDownList"),
                    durumCombobox = $("input.OnlineDurum").data("kendoDropDownList");

                if (thatFuncObj.Durdur)
                    return false;
            },
            Tekrar: false,
            Durdur: false,
            Saniye: { Ilk: 15, Sonra: 16, Max: 20 }
        }],
        Baslat: function (name) {
            var _gorevler = this.Gorevler;
            if (name) {
                $.each(this.Gorevler, function (i, v) {
                    if (v.IslemAdi == name) {
                        var func = function (saniye) {
                            setTimeout(function () {
                                v.Islem();
                                v.Tekrar === true || v.Tekrar == undefined ? func(v.Saniye.Sonra ? v.Saniye.Sonra : v.Saniye) : v.Tekrar > 0 ? (v.Tekrar = v.Tekrar - 1, func(v.Saniye.Sonra ? v.Saniye.Sonra : v.Saniye)) : !0;
                            }, saniye * 1000);
                        }
                        v.Durdur = false;
                        func(v.Saniye.Ilk ? v.Saniye.Ilk : v.Saniye);
                    }
                })
            }
        },
        Durdur: function (name) {
            if (name) {
                $.each(this.Gorevler, function (i, v) {
                    if (v.IslemAdi == name) {
                        v.Durdur = true;
                    }
                });
            }
        }
    },

    // <summary>
    // Veri giriş formlarının durumunun takip edilmesi. (volkansendag - 2013.09.04)
    // </summary>
    Form: {

        // <summary>
        // Üzerinde değişiklik yapılmış form listesi. (volkansendag - 2013.09.04)
        // </summary>
        Liste: [],

        // <summary>
        // Form üzerinde değişiklik işlemlerinin devam ettiğinin belirtilmesi işlemi. (volkansendag - 2013.09.04)
        // </summary>
        Degisti: function (o) {
            $(o).attr("data-Degistimi", "true");
        },

        // <summary>
        // Form üzerindeki değişikliklerin tamamlandığının belirtilmesi işlemi. (volkansendag - 2013.09.04)
        // </summary>
        Kaydedildi: function (o) {

            $(o).attr("data-Degistimi", "false");
            $(o).find('[data-Degistimi="true"]').attr("data-Degistimi", "false");
        },

        // <summary>
        // Form üzerinde değişiklik olup olmadığının kontrolü işlemi. (volkansendag - 2013.09.04)
        // </summary>
        DegistiMi: function (o) {
            return ($(o).attr("data-Degistimi") == "true" || $(o).find('[data-Degistimi="true"]').length > 0);
        },

        // <summary>
        // Browser ın kapatılması yada refresh edilmesi öncesinde uyarı verilmesi işlemi. (volkansendag - 2013.09.04)
        // </summary>
        Kapat: function (e) {
            var msg = 'Kaydedilmemiş formlar mevcut. Bu sayfadan ayrılmanız durumunda veri kaybına uğrayabilirsiniz.';
            e = e || window.event;

            forms = $('[data-Degistimi="true"')
            formCount = (forms.length ? forms.length : 0);

            if ((e) && (formCount > 0)) {
                e.returnValue = msg;
            }
            if ((e) && formCount > 0) {
                return msg;
            }
        }
    },
    stringFunctionInit() {
        if (!String.prototype.format) {
            String.prototype.format = function () {
                var args = arguments;
                return this.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined'
                      ? args[number]
                      : match
                    ;
                });
            };
        }
        if (!String.prototype.countWords) {
            String.prototype.countWords = function () {
                if (!this || this.length <= 0)
                    return 0;

                var regex = /\s+/gi;
                var wordCount = this.trim().replace(regex, ' ').split(' ').length;
                return wordCount;
            }
        }
    },
    Functions: {
        stringify: function stringify(obj) {
            if ("JSON" in window) {
                return JSON.stringify(obj);
            }

            var t = typeof (obj);
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") obj = '"' + obj + '"';

                return String(obj);
            } else {
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);

                for (n in obj) {
                    v = obj[n];
                    t = typeof (v);
                    if (obj.hasOwnProperty(n)) {
                        if (t == "string") {
                            v = '"' + v + '"';
                        } else if (t == "object" && v !== null) {
                            v = cute.stringify(v);
                        }
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        },
        stringToHtml: function (str) {
            return str.replace(/\n/g, '<br />');
        },
        stringFormat: function (format) {
            if (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                var sprintf = function (match, number) {
                    return number in args ? args[number] : match;
                };
                var sprintfRegex = /\{(\d+)\}/g;
                return format.replace(sprintfRegex, sprintf);
            } else {
                return format;
            }
        },
        hide: function (d) {
            $(d).hide("slow");
        },
        toggle: function (d) {
            $(d).toggle("slow", function () {
                var grid = $(this).children("div[data-role='grid']").data("kendoGrid");
                if (grid !== undefined) {
                    if ((grid.element.offset().top > 0) && (!grid.dataSource.hazir)) {
                        grid.dataSource.read();
                        grid.dataSource.hazir = true;
                    }
                }
            });
        },
        // <summary>
        // Cookie'ye kayıt ekler. (volkansendag - 2013.07.24)
        // </summary>
        set_cookie: function (cookie_name, cookie_value, lifespan_in_days, valid_domain) {
            var domain_string = valid_domain ? ("; domain=" + valid_domain) : '';
            document.cookie = cookie_name +
                               "=" + encodeURIComponent(cookie_value) +
                               "; max-age=" + 60 * 60 *
                               24 * lifespan_in_days +
                               "; path=/" + domain_string;
        },

        // <summary>
        // Cookie'den kayıt okur. (volkansendag - 2013.07.24)
        // </summary>
        get_cookie: function (cookie_name) {
            if (document.cookie.length > 0)//checks for the availability of cookie name
            {
                c_start = document.cookie.indexOf(cookie_name + "=");
                if (c_start != -1) {
                    c_start = c_start + cookie_name.length + 1;
                    c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) c_end = document.cookie.length;
                    return decodeURIComponent(document.cookie.substring(c_start, c_end));//returns the cookie after decoding
                }
            }
            return "";
        },

        guidMake: function (e) {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        },
        enumText: function (name, val, dataSource) {
            var _enum = dataSource || Cute.Enums[name];

            var getKeyByValue = function (obj, value) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (obj[prop] === value)
                            return prop;
                    }
                }
            }

            if (_enum) {
                return getKeyByValue(_enum, val)
            } else {
                return val;
            }
        },
        // <summary>
        // Yazdırma işlemlerini yapar (volkansendag - 2014.01.02)
        // ***  elementId = Yazdırılacak elementin kimlik bilgisi girilir. (zorunlu parametre)
        // ***  Title = Yazdırılacak sayfanın başlık bölümüne eklenir. (opsiyonel)
        // ***  Head = <head> tagı içerisine eklenir. (opsiyonel)
        // ***  Title = Yazdırılacak sayfanın başlık bölümüne eklenir (opsiyonel)
        // ***  Title = Yazdırılacak sayfanın başlık bölümüne eklenir (opsiyonel)
        // </summary>
        yazdir: function (z) {
            if (!z) { return false; }
            if (typeof z == "string") { z = { elementId: z } }
            var w, wdoc;
            var getHtml = function (h) {
                html = '<!DOCTYPE html><html><head><meta charset="utf-8" />';
                html += '<title>' + (h.Title ? h.Title : " ") + '</title>'
                html += (h.Head ? h.Head : "");
                html += '</head><body style="width:600px;">';
                html += h.htmlBody;
                html += '</body></html>';
                return html;
            }

            var printHtml = function (html, width) {
                try {
                    win = window.open('', '', 'width=800 , height=900'),
                    doc = win.document.open();
                    doc.write(html);
                    doc.close();
                    win.print();
                    win.close();
                }
                catch (e) {
                    alert('Pençere açılamadı.' + '\n' + e.message);
                }
            }

            if (z.elementId) {
                z.htmlBody = $(z.elementId).clone()[0].outerHTML
            }

            //printHtml(getHtml(z));
            $.print(getHtml(z));
        },
        convertImgToBase64: function convertImgToBase64(url, callback, outputFormat) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                canvas.height = this.height;
                canvas.width = this.width;
                ctx.drawImage(this, 0, 0);
                var dataURL = canvas.toDataURL(outputFormat || 'image/png');
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
        },
        toDate: function (d) {
            try {
                if (window.kendo) {
                    return kendo.parseDate(d)
                } else return d;
            } catch (e) {
                //console.log(e.message, e);
                return d;
            }
        },
        tarih: function (d, type) {
            if (d && window.kendo) {
                return kendo.toString(kendo.parseDate(d, "yyyy/MM/dd"), type ? type : "d");
            }
            return d;
        },
        addSecconds: function (theDate, secs) {
            return new Date(theDate.getTime() + secs * 1000);
        },
        addMinutes: function (theDate, mins) {
            return new Date(theDate.getTime() + mins * 60 * 1000);
        },
        addDays: function (theDate, days) {
            return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
        },
        getDayName: function (d) {
            weekDays = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
            return d ? (d instanceof Date) ? weekDays[d.getDay()] : typeof (d) == "number" ? weekDays[(d)] : !1 : !1;
        },
        getMonthName: function (d) {
            months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
            return d ? (d instanceof Date) ? months[d.getMonth()] : typeof (d) == "number" ? months[(d - 1)] : !1 : !1;
        },
        parseDate: function (d) {
            if (window.kendo) {
                return kendo.parseDate(d);
            } else {
                return d;
            }
        },
        parseJSON: function (d) {
            if (Cute.Validation.IsEmpty(d)) {
                return {};
            } else {
                try {
                    return ("JSON" in window) ? JSON.parse(d) : ($) ? $.parseJSON(d) : d;
                } catch (e) {
                    return {};
                }
            }
        },
        console: function (e, h, t) {
            try {
                if (console != undefined) {
                    console.log(e);
                }
            }
            catch (e) {
                // Console.log(e);
            }
        },
        // <summary>
        // Template html getirilir. Ardından fonksiyon çalıştırılır.(volkansendag - 2015.08.30)
        // ***  o = template html adresidir. farklı kullanım için {name:"", success: function(), error: function()} biciminde kullanılabilir. (zorunlu parametre)
        // ***  s = success durumunda calistirilacak function. (opsiyonel)
        // ***  e = error durumunda calistirilacak function. (opsiyonel)
        // </summary>
        template: function (html) {
            if (window.kendo) {
                return kendo.template(html);
            } else {
                return false;
            }
        },
        delRight: function (str, removeStr, newStr) {
            try {
                var ptrn = new RegExp(removeStr + "+$");
                return str.replace(ptrn, newStr ? newStr : '');
            } catch (e) {
                return str;
            }
        },
        loading: function (show) {
            if (window.kendo) {
                if (undefined == show)
                    show = true;

                kendo.ui.progress($("body"), show);

                return show;
            }
        },
        bind: function (element, model) {
            if (window.kendo) {
                return kendo.bind(element, model);
            }
        },
        observable: function (data) {
            if (window.kendo) {
                return kendo.observable(data);
            } else {
                return data;
            }
        },
        prompt: function (content, value) {
            return kendo.prompt(content, value);
        },
        alert: function (message) {
            return kendo.alert(message);
        },
        confirm: function (message) {
            return kendo.confirm(message)
        },
    }
}

window.cute = Cute.Functions;
Cute.Init();