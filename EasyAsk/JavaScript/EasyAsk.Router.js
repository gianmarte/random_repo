/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Facets
define('Kodella.EasyAsk.EasyAsk.Router'
    , [
        'Facets.Browse.View'
        , 'Kodella.EasyAsk.Facets.Browse.View.Ext'
        , 'Facets.Router'
        , 'Facets.Helper'
        , 'Facets.Model'
        , 'Categories'
        , 'Categories.Model'
        , 'AjaxRequestsKiller'
        , 'Profile.Model'
        , 'Kodella.EasyAsk.EasyAsk.Model'
        , 'Item.Model'

        , 'underscore'
        , 'Backbone'
        , 'jQuery'
        , 'SC.Configuration'
    ]
    , function (
        BrowseView
        , FacetsBrowseExt
        , FacetsRouter
        , Helper
        , Model
        , Categories
        , CategoriesModel
        , AjaxRequestsKiller
        , ProfileModel
        , EAModel
        , ItemModel

        , _
        , Backbone
        , jQuery
        , Configuration
    ) {
        'use strict';

        // @class Facets.Router Mixes the Translator, Model and View @extends Backbone.Router
        return _.extend(FacetsRouter.prototype, {

            addUrl: function (urls, functionToCall)
		    {
                if (urls.length)
                {
                    urls = _.map(urls, function (url)
                    {
                        return url.replace(/^\//, '');
                    });
                    var rootRegex = '^\\b(' + urls.join('|') + ')\\b$'
                    ,	regex = '^\\b(' + urls.join('|') + ')\\b[\\'+Configuration.get('facetDelimiters.betweenFacetNameAndValue')+'\\?].*$';
                    
                    this.route(new RegExp(rootRegex), functionToCall);
                    this.route(new RegExp(regex), functionToCall);
                }
		    }

        ,   showPage: function (isCategoryPage) 
            {
                this.isStillCategoryPage = '';

                if(isCategoryPage)
                {
                    var self = this;

                    var cur_path = Backbone.history.fragment;

                    if(cur_path.search(':') > -1)
                    {
                        self.isStillCategoryPage = false;
                    }
                    else 
                    {
                        self.isStillCategoryPage = true;    
                    }
                }

                var self = this
                    , facetModel = new Model()
                    , ea_model = new EAModel()
                    , fullurl = Backbone.history.fragment
                    , models = [facetModel]
                    , translator = Helper.parseUrl(fullurl, this.translatorConfig, this.isStillCategoryPage)
                    , search_q = translator.options.keywords
                    , path = this.isStillCategoryPage ? translator.categoryUrl : Backbone.history.fragment
                    , url_param = search_q ? ea_model.executeSearch(search_q) : ea_model.executeBreadcrumbClick(path);

                    console.log("ea_model", ea_model);
                    console.log("ea_model.currentPageSize", ea_model.currentPageSize);

                /*facetModel.options = {
                    data: translator.getApiParams()
                    , killerId: AjaxRequestsKiller.getKillerId()
                    , pageGeneratorPreload: true
                };*/

                //if prices aren't to be shown we take out price related facet
                //and clean up the url
                if (ProfileModel.getInstance().hidePrices()) {
                    translator = translator.cloneWithoutFacetId('onlinecustomerprice');
                    Backbone.history.navigate(translator.getUrl());
                }

                if (this.isStillCategoryPage) {
                    var categoryModel = new CategoriesModel();

                    categoryModel.options = {
                        data: { 'fullurl': translator.getCategoryUrl() }
                        , killerId: AjaxRequestsKiller.getKillerId()
                    };

                    facetModel.set('category', categoryModel);
                    models.push(categoryModel);
                }


                console.log("facetModel", facetModel);

                jQuery.when.apply(null, _.invoke(models, 'fetch', {}))
                    .then(function (facetResponse) 
                    {
                        facetResponse = self.isStillCategoryPage ? facetResponse[0] : facetResponse;
                        console.log("facetResponse", facetResponse);
                        console.log("self.isStillCategoryPage", self.isStillCategoryPage);

                        if (facetResponse.corrections && facetResponse.corrections.length > 0) {
                            var unaliased_url = self.unaliasUrl(fullurl, facetResponse.corrections);

                            if (SC.ENVIRONMENT.jsEnvironment === 'server') {
                                nsglobal.statusCode = 301;
                                nsglobal.location = '/' + unaliased_url;
                            }
                            else {
                                Backbone.history.navigate('#' + unaliased_url, { trigger: true });
                            }
                        }
                        else {
                            ea_model.executeCall(url_param).done(function (data) {
                                var item_model = new ItemModel()
                                ,   items = data.source.products ? data.source.products.items : []
                                ,   facets = data.source.attributes ? data.source.attributes.attribute : []
                                ,   itemDesc = data.source.products ? data.source.products.itemDescription : []
                                ,   stateInf = data.source ? data.source.stateInfo : [];

                                /*_.each(data.source.attributes.attribute, function(ea_facets) {
                                    _.each(ea_facets.attributeValueList, function(ea_facets_val) {
                                        var nodeString = ea_facets_val.nodeString;
                                        var ea_link = ea_facets_val.seoPath;
                                        ea_facets_val.sca_link = ea_link.replace(`/${nodeString}`, `?${nodeString}`);
                                    });
                                });*/

                                console.log("data router", data);

                                ea_model.set({
                                    facets: facets
                                ,   items: items
                                ,   itemDescription: itemDesc
                                ,   stateInfo: stateInf
                                });

                                console.log("facetModel", facetModel);

                                for (var idx = 0; idx < items.length; idx++)
                                {
                                    item_model.fetch({
                                        data: {id: items[idx].Product_Id}
                                    })
                                    .done(function(data_items) {
                                        var ea_item = items;

                                        for(var idy = 0; idy < ea_item.length; idy++) {
                                            if(data_items.items[0].internalid == ea_item[idy].Product_Id) {

                                                if(data_items.items[0].itemimages_detail.urls)
                                                {
                                                    ea_item[idy].Image_1_URL = {
                                                        url: data_items.items[0].itemimages_detail.urls[0].url
                                                    ,   altimagetext: items[idy].Product_Name
                                                    };
    
                                                    ea_item[idy].Item_URL = `/${data_items.items[0].urlcomponent}`;
                                                }
                                                
                                            }
                                        }

                                        var view = new FacetsBrowseExt({
                                            translator: translator
                                            , translatorConfig: self.translatorConfig
                                            , application: self.application
                                            , model: facetModel
                                            , ea_model: ea_model
                                            , item_model: item_model
                                        });
        
                                        //translator.setLabelsFromFacets(facetModel.get('facets') || []);
                                        view.showContent();
                                    });
                                }
                            });

                        }
                    });
            }

        ,   EAfacetLoading: function() {
                this.showPage(false);
            }
        });
    });