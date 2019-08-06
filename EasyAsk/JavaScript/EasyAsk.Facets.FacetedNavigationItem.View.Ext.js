// @module Kodella.SiteSearchExt.SiteSearchExt
define('Kodella.EasyAsk.EasyAsk.Facets.FacetedNavigationItem.View.Ext'
	, [
		'Facets.FacetedNavigationItem.View'
		, 'SC.Configuration'
		, 'Backbone.CompositeView'
        , 'Backbone.CollectionView'
        
        , 'kodella_facets_faceted_navigation_item_ext.tpl'

		, 'Utils'
		, 'Backbone'
		, 'jQuery'
		, 'underscore'
		, 'Bootstrap.Slider'
	]
	, function (
		FacetsFacetedNavigationItemView
		, Configuration
		, BackboneCompositeView
        , BackboneCollectionView
        
        , kodella_facets_faceted_navigation_item_ext_tpl

		, Utils
		, Backbone
		, jQuery
		, _
	) {
		'use strict';

		// @class Kodella.SiteSearchExt.SiteSearchExt.View @extends Backbone.View
		return FacetsFacetedNavigationItemView.extend({

            template: kodella_facets_faceted_navigation_item_ext_tpl

        ,	initialize: function ()
		    {
                this.facetId = this.model.get('url') || this.model.get('id');
                this.facet_config = this.options.translator.getFacetConfig(this.facetId);

                //this values is configured in the Configuration File (SCA.Shopping.Configuration)
                if (this.facet_config.template)
                {
                    this.template = this.facet_config.template;
                }
                this.on('afterViewRender', this.renderFacets, this);
		    }

		,	getContext: function ()
			{
				var facet_id = this.facetId
				,	translator = this.options.translator
				,	facet_config = this.facet_config
				,	values = []
				,	range_min = 0
				,	range_max = 0
				,	range_from = 0
				,	range_from_label = ''
				,	range_to = 0
				,	range_to_label = ''
				,	range_values = []
				,	max_items
				,	display_values
				,	extra_values = []
				,	show_facet
				,	show_remove_link
				// fixes the selected items
				,	selected_values = this.options.translator.getFacetValue(facet_id) || [];

				selected_values = _.isArray(selected_values) ? selected_values : [selected_values];
                show_remove_link = !!selected_values.length;
				
				//console.log("this.options", this.options);
				//console.log("this.model facetnavigationitem,", this.model);
				// Prepears the values for display
				var original_values = _.isArray(this.model.get('values')) ? this.model.get('values') : [this.model.get('values')];
				
				//console.log("original_values", original_values);
				if (facet_config.behavior !== 'range')
				{
					_.each(original_values, function(value)
					{
						if (value.url !== '')
						{
							value.isActive = _.contains(selected_values, value.url);
							value.link = value.seoPath; //translator.cloneForFacetId(facet_id, value.url).getUrl();
							value.displayName = value.attributeValue || decodeURIComponent(value.url) || _('(none)').translate();
							value.color = '';
							value.isColorTile = false;
							value.image = {};
							value.isImageTile = false;

							if (facet_config.colors)
							{
								value.color = facet_config.colors[value.label] || facet_config.colors.defaultColor;
								if (_.isObject(value.color))
								{
									value.image = value.color;
									value.color = '';
									value.isImageTile = true;
								}
								else
								{
									value.isColorTile = true;
								}
							}

							values.push(value);
						}
					});
					
					max_items = facet_config.max || values.length;
					display_values = _.first(values, max_items);
					_(display_values).each(function(value)
					{
						value.isLightColor = _.contains(Configuration.get('layout.lightColors', []), value.label);
					});
					extra_values = _.rest(values, max_items);
					show_facet = !!values.length;
				}
				else //if (facet_config.behavior === 'range')
				{
					range_values = _.map(original_values, function (item) {
						return parseFloat(item.url);
					});

					range_min = _.min(range_values);
					range_max = _.max(range_values);

					show_facet = range_max > range_min;
					show_remove_link = this.model.get('max') !== range_max || this.model.get('min') !== range_min;

					var translator_value = translator.getFacetValue(facet_id) || {from: range_min, to: range_max};
					range_from = translator_value.from;
					range_to = translator_value.to;

					range_to_label = _.isFunction(facet_config.parser) ? facet_config.parser(range_to, false) : range_to;
					range_from_label = _.isFunction(facet_config.parser) ? facet_config.parser(range_from, false) : range_from;
				}
				// @class Facets.FacetedNavigationItem.View.Context
				
				var context = {
					//@property {String} htmlId
					htmlId: _.uniqueId('facetList_')
					//@property {String} facetId
				,	facetId: facet_id
					//@property {Boolean} showFacet
				,	showFacet: show_facet
					//@property {Boolean} showHeading
				,	showHeading: _.isBoolean(facet_config.showHeading) ? facet_config.showHeading : true
					//@property {Boolean} isUncollapsible
				,	isUncollapsible: !!facet_config.uncollapsible
					//@property {Boolean} isCollapsed
				,	isCollapsed: !this.facet_config.uncollapsible && this.facet_config.collapsed
					//@property {Boolean} isMultiSelect
				,	isMultiSelect: facet_config.behavior === 'multi'
					//@property {Boolean} showRemoveLink
				,	showRemoveLink: show_remove_link
					//@property {String} removeLink
				,	removeLink: translator.cloneWithoutFacetId(facet_id).getUrl()
					//@property {String} facetDisplayName
				,	facetDisplayName: facet_config.name || facet_id
					//@property {Array<Object>} values
				,	values: values
					//@property {Array<Object>} displayValues
				,	displayValues: display_values
					//@property {Array<Object>} extraValues
				,	extraValues: extra_values
					//@property {Boolean} showExtraValues
				,	showExtraValues: !!extra_values.length
					//@property {Boolean} isRange
				,	isRange: facet_config.behavior === 'range'
					//@property {Array<Number>} rangeValues
				,	rangeValues: range_values
					//@property {Number} rangeMin
				,	rangeMin: range_min
					//@property {Number} rangeMax
				,	rangeMax: range_max
					//@property {Number} rangeFrom
				,	rangeFrom: range_from
					//@property {String} rangeFromLabel
				,	rangeFromLabel: range_from_label
					//@property {Number} rangeTo
				,	rangeTo: range_to
					//@property {String} rangeToLabel
				,	rangeToLabel: range_to_label
				,	seoPath: values.nodeString
				};

				// @class Facets.FacetedNavigationItem.View
				return context;
			}
		});
	});