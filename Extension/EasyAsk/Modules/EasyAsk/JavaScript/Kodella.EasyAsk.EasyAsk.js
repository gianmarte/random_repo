define(
	'Kodella.EasyAsk.EasyAsk'
	, [
		'Kodella.EasyAsk.Facets.Browse.View.Ext'
		, 'Facets.Model'
		, 'Facets.Translator'
		, 'Kodella.EasyAsk.EasyAsk.Model'
		, 'Kodella.EasyAsk.EasyAsk.Router'

		, 'jQuery'
		, 'Backbone'
		, 'underscore'
	]
	, function (
		FacetsBrowseViewExt
		, FacetModel
		, Translator
		, EasyAskModel
		, FacetRouter

		, jQuery
		, Backbone
		, _
	) {
		'use strict';

		function getEasyAskFacets(application, router) {
			var cat_path = window.location.hash != "" ? window.location.hash : window.location.pathname;

			var ea_model = new EasyAskModel()
				, ea_cat_url = ea_model.executeBreadcrumbClick(cat_path);

			return ea_model.executeCall(ea_cat_url).done(function (data) {
				prepareRouterExt(application, router, data)
			});
		}

		function prepareRouterExt(app, route, ea) {
			var facets_arr = []
				, facets_obj = ea.source.attributes ? ea.source.attributes.attribute : [];

			_.each(facets_obj, function (facets) {
				_.each(facets, function (facets_attr) {
					_.each(facets_attr, function (facets_seopath) {

						facets_arr.push(facets_seopath.seoPath);
					});
				});
			});

			route.addUrl(_.compact(facets_arr), 'facetLoading');
		}

		return {
			/*Translator: Translator
			, Router: FacetRouter
			, prepareRouter: getEasyAskFacets
			,*/ mountToApp: function mountToApp(container) {
				// using the 'Layout' component we add a new child view inside the 'Header' existing view 
				// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
				// more documentation of the Extensibility API in
				// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html
				//Backbone.history.on("all", this.getEasyAskJSON(container), this);
				var is_plp = window.location.pathname != '/';//'/sca-dev-aconcagua/shopping-local.ssp';

				if (is_plp) {
					getEasyAskFacets(container, FacetRouter);
				}


				return FacetRouter;
				//this.onRefreshPage(container);
				//console.log("window.location mount to app", window.location);
			}

			/*, getEasyAskJSON: function (container) {
				/** @type {LayoutComponent}
				var plp = container.getComponent('PLP');
				var layout = container.getComponent('Layout');
				var ea_model = new EasyAskModel();
				if (plp) {
					plp.addChildView('EasyAsk.Response', function () {
						return new FacetsBrowseViewExt({
							plp: plp
						,	model: ea_model
						});
					});
				}
			}*/
		};
	});