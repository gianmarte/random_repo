// @module Kodella.SiteSearchExt.SiteSearchExt
define('Kodella.EasyAsk.EasyAsk.Facets.FacetedNavigation.View.Ext'
	, [
		'Facets.FacetedNavigation.View'
		, 'Kodella.EasyAsk.EasyAsk.Facets.FacetedNavigationItem.View.Ext'
		, 'Facets.FacetedNavigationItem.View'
		, 'SC.Configuration'
		, 'Profile.Model'
		, 'Backbone.CompositeView'
		, 'Backbone.CollectionView'

		, 'facets_faceted_navigation.tpl'

		, 'Utils'
		, 'Backbone'
		, 'jQuery'
		, 'underscore'
	]
	, function (
		FacetsFacetedNavigationView
		, FacetsFacetedNavigationItemViewExt
		, FacetsFacetedNavigationItemView
		, Configuration
		, ProfileModel
		, BackboneCompositeView
		, BackboneCollectionView

		, facets_faceted_navigation_tpl

		, Utils
		, Backbone
		, jQuery
		, _
	) {
		'use strict';

		// @class Kodella.SiteSearchExt.SiteSearchExt.View @extends Backbone.View
		return FacetsFacetedNavigationView.extend({

			template: facets_faceted_navigation_tpl

		,	initialize: function(options) {
				FacetsFacetedNavigationView.prototype.initialize.apply(this, arguments);
			}

			, childViews: _.extend({}, FacetsFacetedNavigationView.prototype.childViews, {
				'Facets.FacetedNavigationItems': function()
				{
					var translator = this.options.translator //FacetsHelper.parseUrl(this.options.translatorUrl, this.options.translatorConfig, this.options.translator.categoryUrl)
					,	ordered_facets = this.options.facets;
	
					//if prices aren't to be shown we take out price related facet
					var hidden_facet_names = Configuration.get('loginToSeePrices.hiddenFacetNames', []);
	
					if (ProfileModel.getInstance().hidePrices())
					{
						ordered_facets = _.reject(ordered_facets, function (item)
						{
							return _.indexOf(hidden_facet_names, item.id) >= 0;
						});
					}
	
					return new BackboneCollectionView({
						childView: FacetsFacetedNavigationItemViewExt
					,	viewsPerRow: 1
					,	collection: new Backbone.Collection(ordered_facets)
					,	childViewOptions: {
							translator: translator
						}
					});
				}
			})
		});
	});