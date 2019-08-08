define('Kodella.EasyAsk.Facets.Browse.View.Ext'
	, [
		'Facets.Browse.View'
		, 'Facets.FacetedNavigation.View'
		, 'Kodella.EasyAsk.EasyAsk.Facets.FacetedNavigation.View.Ext'
		, 'Facets.FacetedNavigationItem.View'
		, 'Kodella.EasyAsk.EasyAsk.Facets.FacetedNavigationItem.View.Ext'
		, 'Facets.ItemCell.View'
		, 'Kodella.EasyAsk.EasyAsk.Facets.ItemCell.View.Ext'
		, 'Kodella.EasyAsk.EasyAsk.Facets.ItemListShowSelector.View.Ext'
		, 'Item.Model'
		, 'GlobalViews.Pagination.View'
		, 'Kodella.EasyAsk.EasyAsk.Model'
		, 'LiveOrder.Model'

		, 'kodella_easyask_easyask.tpl'
		, 'facets_items_collection.tpl'
		, 'facets_items_collection_view_cell.tpl'
		, 'facets_items_collection_view_row.tpl'

		, 'Utils'
		, 'Backbone'
		, 'Backbone.CollectionView'
		, 'Backbone.CompositeView'
		, 'jQuery'
		, 'underscore'
	]
	, function (
		FacetsBrowseView
		, FacetsFacetedNavigationView
		, FacetsFacetedNavigationViewExt
		, FacetsFacetedNavigationItemView
		, FacetsFacetedNavigationItemViewExt
		, FacetsItemCellView
		, FacetsItemCellViewExt
		, FacetsItemListShowSelectorViewExt
		, ItemModel
		, GlobalViewsPaginationView
		, EAModel
		, LiveOrderModel

		, kodella_easyask_easyask_tpl
		, facets_items_collection_tpl
		, facets_items_collection_view_cell_tpl
		, facets_items_collection_view_row_tpl

		, Utils
		, Backbone
		, BackboneCollectionView
		, BackboneCompositeView
		, jQuery
		, _
	) {
		'use strict';

		// @class Kodella.SiteSearchExt.SiteSearchExt.View @extends Backbone.View
		return FacetsBrowseView.extend({

			template: kodella_easyask_easyask_tpl

			, events: _.extend(FacetsBrowseView.prototype.events, {})

			, initialize: function(options) {
				
				FacetsBrowseView.prototype.initialize.apply(this,arguments);
				//console.log("options", options);

				this.ea_model = options.ea_model;
				this.resultsPerPage = Utils.deepCopy(options.application.getConfig('easyAskConfig.pageSize'));
				this.fragment = Backbone.history.fragment;
				//console.log("this.ea_model facet browse", this.ea_model);
				//console.log("this.getPagination()", this.getPagination());
			}

			, _gotoFacets: function _gotoFacets(e)
			{
				var cur_selection = jQuery(e.currentTarget).attr('data-easeopath')
				,	backbone_loc = Backbone.history.location
				,	protocol = backbone_loc.protocol
				,	host = backbone_loc.host
				,	hash = backbone_loc.hash
				,	path = backbone_loc.pathname
				,	param = window.location.hash.indexOf('?') > 0 ? `&${cur_selection}` : `?${cur_selection}`
				,	new_url = `${hash}${param}`
				,	self = this
				,	attr_name = []
				,	attr_val = [];

					window.history.replaceState({}, document.title, new_url);

					if(window.history.replaceState)
					{
						var new_path = window.location.href.toString()
						,	param_idx = new_path.indexOf('?')
						,	param_str = new_path.substring(param_idx+1, new_path.length-1)
						,	param_end_idx = param_str.indexOf(':')
						,	param_name = param_str.substring(0, param_end_idx);
						
						attr_name.push(param_name);
					}
					
					var final_param = attr_name.join(';');
					
			}

			, getEasyAskAttr: function() 
			{
				var facet_arr = [];
				var facets = this.ea_model.get('facets');

				for(var i = 0; i < facets.length; i++) 
				{
					var facet_obj = {};
					
					facet_obj.id = facets[i].name;
					facet_obj.values = facets[i].attributeValueList;
					facet_obj.isInitDispLimited = facets[i].isInitDispLimited;
					facet_obj.url = facets[i].name;

					facet_arr.push(facet_obj);
				}

				return facet_arr;
			}

			, getPagination: function getPagination()
			{
				var self = this;
				this.products = this.ea_model.get('itemDescription');

				return _.extend({}, FacetsBrowseView.prototype.getPagination.apply(this, arguments), {
					currentPage: self.products.currentPage
				,	pageCount: self.products.pageCount
				,	pageSize: parseInt(self.products.resultsPerPage)
				,	itemCount: self.products.totalItems
				});
			}

		,	_gotoShow: function(e) 
			{
				var plp = this.application.getComponent('PLP');
				var cur_selection = e.currentTarget.value;
				console.log("cur_selection", cur_selection);

			}

			, childViews: _.extend(FacetsBrowseView.prototype.childViews, 
			{
				'Facets.FacetedNavigation': function(options)
				{
					//console.log("this.ea_model", options);
					var self = this;
					var facets_length = this.ea_model.get('facets') ? this.ea_model.get('facets').length : 0;

					var exclude = _.map((options.excludeFacets || '').split(','), function (facet_id_to_exclude)
					{
						return jQuery.trim( facet_id_to_exclude );
					})
				,	has_categories = !!(this.category && this.category.categories)
				,	has_items = this.ea_model.get('items').length
				,	has_facets =  has_items && facets_length /*has_items && this.model.get('facets').length*/
				,	applied_facets = this.ea_model.get('stateInfo')
				,	has_applied_facets = applied_facets.length
				,	facets = this.getEasyAskAttr();

				return new FacetsFacetedNavigationViewExt({
					categoryItemId: this.category && this.category.itemid
				,	clearAllFacetsLink: this.translator.cloneWithoutFacets().getUrl()
				,	hasCategories: has_categories
				,	hasItems: has_items

					// facets box is removed if don't find items
				,	hasFacets: has_facets

				,	hasCategoriesAndFacets: has_categories && has_facets

					// Categories are not a real facet, so lets remove those
				,	appliedFacets: applied_facets

				,	hasFacetsOrAppliedFacets: has_facets || has_applied_facets

				//,	translatorUrl: this.translator.getUrl()
				,	translator: this.translator

				//,	translatorConfig: this.options.translatorConfig
				,	facets: facets /*_.filter(this.model.get('facets'), function (facet)
					{
						return !_.contains(exclude, facet.id);
					})*/

				,	totalProducts: self.ea_model.get('itemDescription').totalItems
				,	keywords: this.translator.getOptionValue('keywords')
				});
				}
				//Extra Facet filter View
			,	'Facets.FacetedNavigation.Item': function (options)
				{
					console.log("facet browse", options);
					var facet_config = this.translator.getFacetConfig(options.facetId)
					,	contructor_options = {
							model: new Backbone.Model(this.ea_model.get('facets'))
						,	translator: this.translator
						,	stateInfo: this.ea_model.get('stateInfo')
						};

					if (facet_config.template)
					{
						contructor_options.template = facet_config.template;
					}

					return new FacetsFacetedNavigationItemViewExt(contructor_options);
				}

			,	'Facets.Items': function()
				{
					var self = this
					,	display_option = _.find(this.itemsDisplayOptions, function (option)
						{
							return option.id === self.options.translator.getOptionValue('display');
						});
	
					return new BackboneCollectionView({
						childTemplate: display_option.template
					,	childView: FacetsItemCellViewExt
					,	childViewOptions: {
							application: this.application
						}
					,	viewsPerRow: parseInt(display_option.columns, 10)
					,	collection: this.ea_model.get('items')
					,	cellTemplate: facets_items_collection_view_cell_tpl
					,	rowTemplate: facets_items_collection_view_row_tpl
					,	template: facets_items_collection_tpl
					,	context: {
							keywords: this.translator.getOptionValue('keywords')
						}
					});
				}

			,	'Facets.ItemListShowSelector': function()
				{
					return new FacetsItemListShowSelectorViewExt({
						options: this.resultsPerPage
					,	translator: this.translator
					});
				}

			,	'GlobalViews.Pagination': function()
				{
					var self = this;
					this.products = this.ea_model.get('itemDescription');

					return new GlobalViewsPaginationView(_.extend({
						currentPage: self.products.currentPage
					,	totalPages: self.products.pageCount
					}));
				}
			})

			, getContext: function () 
			{
				var self = this;
				//console.log("self.ea_info", self.ea_info);
				return _.extend({}, FacetsBrowseView.prototype.getContext.apply(this, arguments), {
					total: self.ea_model.get('itemDescription').totalItems
				});
			}
		});
	});