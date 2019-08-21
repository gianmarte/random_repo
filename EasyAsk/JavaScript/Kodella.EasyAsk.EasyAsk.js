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

		/*function getEasyAskFacets(application, router) {
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

				console.log("facets_obj", facets_obj);

			_.each(facets_obj, function (facets) {
				_.each(facets, function (facets_attr) {
					_.each(facets_attr, function (facets_seopath) {
						facets_arr.push(facets_seopath.seoPath);
					});
				});
			});

			var isSearch = window.location.hash;

			console.log("window.location", window.location);
			console.log("isSearch", isSearch);
			console.log("isSearch && isSearch.search('keywords')", isSearch && isSearch.search('keywords'));

			if(isSearch && isSearch.search('keywords') > 0)
			{
				var search_query = isSearch.substring(isSearch.search('=')+1);
				console.log("search_query", search_query);
			}

			route.addUrl(_.compact(facets_arr), 'facetLoading');
		}*/

		return {
				mountToApp: function mountToApp(container) {
				// using the 'Layout' component we add a new child view inside the 'Header' existing view 
				// (there will be a DOM element with the HTML attribute data-view="Header.Logo")
				// more documentation of the Extensibility API in
				// https://system.netsuite.com/help/helpcenter/en_US/APIs/SuiteCommerce/Extensibility/Frontend/index.html

				/*var isSearch = window.location.hash;

				console.log("window.location", window.location);
				console.log("isSearch", isSearch);
				console.log("isSearch && isSearch.search('keywords') > 0", isSearch && isSearch.search('keywords') > 0);
	
				if(isSearch && isSearch.search('keywords') > 0)
				{
					var search_query = isSearch.substring(isSearch.search('=')+1);
					console.log("search_query", search_query);
				}

				var is_plp = window.location.hash != "";//window.location.pathname != '/';

				console.log("is_plp", is_plp);
				if (is_plp) {
					getEasyAskFacets(container, FacetRouter);
				}*/


				return FacetRouter;
			}
		};
	});