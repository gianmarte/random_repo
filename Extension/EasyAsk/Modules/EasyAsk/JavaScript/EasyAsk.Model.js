define('Kodella.EasyAsk.EasyAsk.Model'
    , [
        'Backbone'
        , 'Backbone.CachedModel'
        , 'underscore'
        , 'Utils'
        , 'SC.Configuration'
        , 'jQuery'
        , 'Item.Model'
    ]
    , function
        (
            Backbone
            , BackboneCachedModel
            , _
            , Utils
            , Configuration
            , $
            , ItemModel
        ) {
        'use strict';

        $.getPageSize = function() {
            var pageSizes = Configuration.get('easyAskConfig.pageSize');
            var defaultSize = 0;

            for(var idx = 0; idx < pageSizes.length; idx++) {
                if(pageSizes[idx].isDefault) {
                    defaultSize = pageSizes[idx].items;
                }
            }

            console.log("defaultSize", defaultSize);
            return defaultSize;
        };

        return BackboneCachedModel.extend({
            defaults: {
                server: `//${Configuration.get('easyAskConfig.server')}`
                , dct: `${Configuration.get('easyAskConfig.dct')}`
                , cols: 4
                , fields: {
                    id: 'Product_Id'
                    , image: 'picture'
                    , name: 'Product_Name'
                    , price: 'Price'
                    , desc: 'Description'
                    , mfr: 'Manufacturer'
                }
                , extraProperties: ''
                , overlayFields: true
                , value: (item, field) => { return item[field]; }
            }
            , ATTR_VALUE_TYPE_RANGE: 2
            , path: ''
            , currentPageSize: $.getPageSize()
            , currentPage: 1
            , currentSort: '-default-'
            , pageCount: 0
            , KEYCODE_ENTER: 13
            , KEYCODE_NUMPAD_ENTER: 176

            , init: function (opts) {
                var self = this;
                var options = $.extend(true, this.defaults.opts);
                self.config = options;
                this.baseURL = this.defaults.server + '/EasyAsk/apps/Advisor.jsp?indexed=1&ie=UTF-8&rootprods=1&disp=json&dct=' + this.defaults.dct;

                if (options.extraProperties && $.isArray(options.extraProperties)) {
                    for (var i = 0; i < options.extraProperties.length; i++) {
                        var prop = options.extraProperties[i];
                        if (prop.name && prop.value) {
                            this.baseURL += ('&eap_' + prop.name + '=' + encodeURIComponent(prop.value));
                        }
                    }
                }

                this.basePromotionURL = this.defaults.server + '/EasyAsk/apps/CrossSellToResults.jsp?indexed=1&ie=UTF-8&rootprods=1&disp=json&dct=' + this.defaults.dct;
                this.value = this.defaults.value;

                if (opts.sessionid) {
                    this.baseURL += '&sessionid=' + opts.sessionid;
                    this.basePromotionURL += '&sessionid=' + opts.sessionid;
                }
                else {
                    this.baseURL += '&oneshot=1';
                    this.basePromotionURL += '&oneshot=1';
                }

                this.executeCall(this.baseURL);
            }

            , formatNumber: function (val, decimal, group) {
                var re = '\\d(?=(\\d{' + (group || 3) + '})+' + (decimal > 0 ? '\\.' : '$') + ')';

                return Number(val).toFixed(Math.max(0, ~~decimal)).replace(new RegExp(re, 'g'), '$&,');
            }

            , rawNumber: function (val, decimal) {
                return Number(val).toFixed(Math.max(0, ~~decimal));
            }

            , addPath: function (cat) {
                return '&CatPath=' + encodeURIComponent(this.path + (cat ? ('////' + cat) : ''));
            }

            , formURL: function () {
                this.baseURL = this.defaults.server + '/EasyAsk/apps/Advisor.jsp?indexed=1&ie=UTF-8&rootprods=1&disp=json&dct=' + this.defaults.dct;
                console.log("this.baseURL", this.baseURL);
                return this.baseURL + '&ResultsPerPage=' + this.currentPageSize + '&defsortcols=' + (this.currentSort == '-default-' ? '' : this.currentSort);
            }

            , doAttributeClick: function(seoPath){
				this.executeBreadcrumbClick(seoPath);
				return;
			}

            , executeSearch: function (q, path) {
                this.path = path || '';
                var url = this.formURL() + '&RequestAction=advisor&RequestData=CA_Search&q=' + encodeURIComponent(q) + this.addPath();
                return url;
                this.invoke(url);
            }

            , executeAttribute: function (attr, val, path) {
                var url = this.formURL() + '&RequestAction=advisor&RequestData=CA_AttributeSelected&CatPath=' + encodeURIComponent(path || this.path) + '&AttribSel=' + encodeURIComponent(attr + " = '" + val + "'");
                return url;
                this.invoke(url);
            }

            , executeRageAttr: function (attr, val, node) {
                if (node) {
                    this.executeSEORangeAttr(attr, val, node);
                }
                else {
                    var pathParts = this.path.split('////')
                        , key = 'AttribSelect=' + attr + ' = \''
                        , newParts = [];

                    for (var i = 0; i < pathParts.length; i++) {
                        var seg = pathParts[i];

                        if (seg.indexOf(key) != 0) { // not the attribute select
                            newParts.push(seg);
                        }
                    }

                    this.executeAttribute(attr, val, newParts.join('////'));
                }
            }

            , executeMVAttribute: function (vals, path) {
                var url = this.formURL() + '&RequestAction=advisor&RequestData=CA_AttributeSelected&CatPath=' + encodeURIComponent(path || this.path) + '&AttribSel=' + encodeURIComponent(vals);
                this.invoke(url);
            }

            , executeToplevelArrangeBy: function (grpName) {
                var url = this.formURL() + '&RequestAction=advisor&RequestData=CA_BreadcrumbClick&CatPath=&defarrangeby=' + encodeURIComponent(grpName);
                this.invoke(url);
            }

            , executeBreadcrumbClick: function (bc) {
                if (bc == 'All Products') {
                    bc = '';
                }
                var url = this.formURL() + '&RequestAction=advisor&RequestData=CA_BreadcrumbClick&CatPath=' + encodeURIComponent(bc);
                return url;
                this.invoke(url);
            }

            , executeStudioPreview: function (bc) {
                var url = this.formURL() + '&studiopreview=1&RequestAction=advisor&RequestData=CA_BreadcrumbClick&CatPath=' + encodeURIComponent(bc);
                this.invoke(url);
            }

            , executeStudioPreviewSearch: function (q, bc) {
                var url = this.formURL() + '&studiopreview=1&RequestAction=advisor&RequestData=CA_Search&CatPath=' + encodeURIComponent(bc) + '&question=' + encodeURIComponent(q);
                this.invoke(url);
            }

            , gotoPage: function (val) {
                var url = this.formURL() + '&RequestAction=navbar&RequestData=' + encodeURIComponent('page' + val) + this.addPath();
                this.invoke(url);
            }

            , pageOp: function (val) {
                var url = this.formURL() + '&RequestAction=navbar&RequestData=' + encodeURIComponent(val) + this.addPath() + '&currentpage=' + this.currentPage;
                this.invoke(url);
            }

            , getNormalizedValue: function (val) {
                var normalizedVal = (Math.round(parseFloat(val) * 2) / 2).toFixed(1);

                return normalizedVal;
            }

            , findItem: function (id) {
                var fields = this.options.fields;

                if (fields.id) // need an id field
                {
                    var items = this.currentProducts;

                    for (var i = 0; i < items.length; i++) {
                        if (items[i][fields.id] == id) {
                            return items[i];
                        }
                    }
                }
                return '';
            }

            , findCarveOut: function (id) {
                var fields = this.options.fields;

                if (fields.id) // need an id field
                {
                    var items = this.currentCarveOuts;

                    for (var i = 0; i < items.length; i++) {
                        if (items[i][fields.id] == id) {
                            return items[i];
                        }
                    }
                }
                return '';
            }

            , findFeaturedItem: function (id) {
                var fields = this.options.fields;

                if (fields.id)  // need an id field
                {
                    var items = this.featuredItems;

                    for (var i = 0; i < items.length; i++) {
                        if (items[i][fields.id] == id) {
                            return items[i];
                        }
                    }
                }
                return '';
            }

            , promotionTypes: ['Cross-Sell', 'Up-Sell', 'Down-Sell', 'Add-On', 'Common Item', 'Substitution', 'Complementary', 'Non-Complementary', 'Promotions']

            , getPromotions: function (id) {
                var result = [];
                this.getPromotionByType(id, 0, promotionTypes, results);
            }

            , getItems: function (data) {
                if (data && data.products) {
                    return data.products.items;
                }
                return null;
            }

            , processPromotionResults: function (data, type, results) {
                var items = this.getItems(data);
                if (items && items.length) {
                    results.push({ type: type, items: items });
                }
            }

            , getPromotionByType: function (id, idx, types, results) {
                if (idx < types.length) {
                    var self = this;
                    $.ajax({
                        url: this.basePromotionURL,
                        data: {
                            q: id,
                            type: types[idx]
                        },
                        type: 'POST',
                        crossDomain: true,  // cross comain
                        dataType: 'jsonp',  // handles cross domain
                        success: function (data, textStatus, jqXHR) {
                            self.processPromotionResults(data, types[idx], results);
                            self.getPromotionByType(id, idx + 1, types, results);
                        },
                        error: function (data, textStatus, jqXHR) {
                            alert('error: ' + data);
                        }
                    });
                }
                else {
                    this.processPromotions(id, results);
                }
            }

            , htmlXSell: function (items) {
                var fields = this.options.fields;

                if (fields.rating) {
                    for (var i = 0; i < items.length; i++) {
                        items[i].normalizedVal = this.getNormalizedValue(this.value(items[i], fields.rating));
                    }
                }

                var args = {
                    prods: { items: items },
                    fields: this.options.fields,
                    opts: { overlayFields: false }
                };

                html = this.compiledProd(args);

                return html;
            }

            , processPromotions: function (id, xsells) {
                window.console && console.log('id: ' + id + ' xsells: ' + xsells.length);
                this.buildPromotionHTML(xsells);
            }

            , getOverlayColumnName: function (dataDescription, name) {
                if (name == 'EAFeatured Weight') {
                    return 'EAWeight';
                }
                else if (dataDescription) {
                    for (var i = 0; i < dataDescription.length; i++) {
                        if (dataDescription[i].columnName == name) {
                            return dataDescription[i].tagName;
                        }
                    }
                }
                else if (name == 'EAShelfOrder') {
                    return ''
                }
                else {
                    return name;
                }
            }

            , getOverlayColumnLabel: function (name) {
                if (name == 'EAFeatured Weight' || name == 'EAWeight') {
                    return 'Business';
                }
                else if (name == 'EAScore') {
                    return 'Relevancy';
                }
                else if (name == 'EAPersonalization') {
                    return 'Personalization';
                }

                return name;
            }

            , SWATCHES_PER_LINE: 4

            , encodeSearch: function (s) {
                var sb = '';
                if (s && 0 < s.length) {
                    sb = '-';
                    for (var i = 0; i < s.length; i++) {
                        var ch = s[i];
                        if (/\s/.test(ch)) {
                            sb += '-';
                        }
                        else if ('/' == ch) {
                            sb += '@';  // encode slashes (path sep as atSign
                        }
                        else if ('@' == ch) {
                            sb += '\\@';  // escape the escape char
                        }
                        else if ('-' == ch) {
                            sb += '\\-';  // escape the escape char
                        }
                        else {
                            sb += ch;
                        }
                    }
                }
                return sb;
            }

            , invoke: function (url) {
                var path = $.urlParam('CatPath', url);

                if (!path) {
                    path = $.urlParam('ea_path', url);
                }

                if (path) {
                    path = decodeURIComponent(path);
                }

                var q = $.urlParam('q', url);

                if (q) {
                    if (path) {
                        path += '/';
                    }

                    path += this.encodeSearch(decodeURIComponent(q));
                }
                var attr = $.urlParam('AttribSel', url);

                if (attr) { // old style
                    path += ('&AttribSel=' + decodeURIComponent(attr));
                }

                //var href = window.location.origin + window.location.pathname;

                //history.pushState(url,null,href + '?dct=' + this.defaults.dct + (path?'&ea_path=' + path:''));
                window.console && console.log("invoke: " + url);
                this.executeCall(url);
            }

            , isSearchRequest: function (url) {
                return url && -1 < url.indexOf('RequestAction=advisor') && -1 < url.indexOf('&RequestData=CA_Search');
            }


            , getImgURL: function(item) {
               
                var item_model = new ItemModel();
                var items = item.source.products ? item.source.products.items : [];
                var self = this;

                for(var idx = 0; idx < items.length; idx++)
                {
                    item_model.fetch({
                        data: {id: items[idx].Product_Id}
                    })
                    .done(function(data) {
                        self.addImgURL(data.items, item);
                    });
                }
            }

            , addImgURL: function(img, item) {
                var ea_item = item.source.products.items;

                for(var idx = 0; idx < ea_item.length; idx++) {
                    if(img[0].internalid == ea_item[idx].Product_Id) {
                        //console.log("ids", img[0].internalid + ", " + ea_item[idx].Product_Id);
                        ea_item[idx].Image_1_URL = {
                            url: img[0].itemimages_detail.urls[0].url
                        ,   altimagetext: ""
                        };

                        ea_item[idx].Item_URL = `/${img[0].urlcomponent}`;
                    }
                }

                return item;
            }

            , executeCall: function (url) {
                window.console && console.log("executeCall: " + url);
                var self = this;
                var isSearch = self.isSearchRequest(url);
                var obj = {};

                return $.ajax({
                    url: url
                    , type: 'POST'
                    , async: false
                    , crossDomain: true //cross domain
                    , dataType: 'jsonp' // handles cross domain
                })
                    .done(function (data) {
                        self.getImgURL(data);
                        return data;

                        /*var item_model = new ItemModel();
                        var items = data.source.products.items;
        
                        for(var idx = 0; idx < items.length; idx++)
                        {
                            item_model.fetch({
                                data: {id: items[idx].Product_Id}
                            })
                            .done(function(item_data) {
                                self.addImgURL(item_data.items, data);
                            });
                        }*/
                    })
                    .fail(function (data, textStatus, jqXHR) {
                        console.log("error: ", data);
                    });
            }
        });
    });