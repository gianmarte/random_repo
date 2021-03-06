/*jshint esversion: 6 */

var fs = require('fs')
,	gutil = require('gulp-util')
,	glob = require('glob')
,	nconf = require('nconf')
,	path = require('path')
,	_ =  require('underscore')
;

'use strict';

var manifest_manager = require('../manifest-manager');

var mod_regex;

function getManifests()
{
	var manifests = [manifest_manager.getThemeManifest()];

	if(nconf.get('extensionMode'))
	{
		manifests = manifest_manager.getExtensionManifests();
	}

	return manifests;
}

function getFilePatterns()
{
	var file_patterns = [nconf.get('folders:theme_path')];

	if(nconf.get('extensionMode'))
	{
		file_patterns = nconf.get('folders:extensions_path');
	}

	file_patterns = file_patterns.map((file) => file + '/**/*.*');

	return file_patterns;
}

function computeDifferences()
{
	var file_manifest
	,	manifest_diff_promises = []
	;

	var differences = {
		add: []
	,	delete: []
	};

	var patterns = getFilePatterns();

	manifest_diff_promises = _.map(patterns, function(extension_glob)
	{
		return new Promise((resolve, reject) => {

			glob(extension_glob, {}, function (err, files) {

				if(err)
				{
					reject(err);
				}

				differences = {
					add: []
				,	delete: []
				};

				files = files.map((file) => { return file.replace(/\\/g, '/'); });
				
		  		if(files && files.length)
		  		{
			  		file_manifest = manifest_manager.findManifest(files[0]);
					mod_regex = new RegExp('\/' + file_manifest.name + '\/(.*)');
					
					var asset_regex = new RegExp('\/'+ file_manifest.name + '\/assets\/(.*)');
					
			  		var sass_files = _.filter(files, (file_path) => { return file_path.endsWith('.scss') && !asset_regex.test(file_path); })
			  		,	tpl_files = _.filter(files, (file_path) => { return file_path.endsWith('.tpl') && !asset_regex.test(file_path); })
			  		,	config_files = _.filter(files, (file_path) => { return file_path.endsWith('.json') && path.basename(file_path) !== 'manifest.json' && !asset_regex.test(file_path); })
			  		,	js_files = _.filter(files, (file_path) => { return file_path.endsWith('.js') && !asset_regex.test(file_path); })
			  		,	assets_files = _.filter(files, function(file_path)
						{ 
							//accept as asset everything that's on the assets folder regardless of extension
							return asset_regex.test(file_path);
						});

					_computeSassDiff(file_manifest, sass_files, differences);
					_computeTemplatesDiff(file_manifest, tpl_files, differences);
					_computeConfigDiff(file_manifest, config_files, differences);
					_computeJSDiff(file_manifest, js_files, differences);
					_computeAssetDiff(file_manifest, assets_files, differences);
					
					_computeSkinDiff(file_manifest, config_files, differences);
					
					resolve({
						differences: differences
					,	manifest: file_manifest
					});
		  		}
				
			});

		});
		
	});

	return manifest_diff_promises;
}

function _computeSassDiff(manifest, files, differences)
{
	var module_path;	

	if(manifest.sass && manifest.sass.files)
	{
		_.each(manifest.sass.files, function(manifest_path)
		{
			var file_path = path.join(manifest.local_folder, manifest_path).replace(/\\/g, '/');
			if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
			{
				differences.delete.push(file_path);
			}
		});

		_.each(files, function(file_path)
		{
			module_path = file_path.match(mod_regex) && file_path.match(mod_regex)[1];
			
			if(!_.contains(manifest.sass.files, module_path) && !_.contains(differences.add, file_path))
			{
				differences.add.push(file_path);
			}
		});
	}
	else
	{
		differences.add = differences.add.concat(files);
	}
}

function _computeTemplatesDiff(manifest, files, differences)
{
	var module_path;	

	if(manifest.templates && manifest.templates.application)
	{
		_.each(manifest.templates.application, function(files_data, application)
		{
			_.each(manifest.templates.application[application].files, function(manifest_path)
			{
				var file_path = path.join(manifest.local_folder, manifest_path).replace(/\\/g, '/');
				if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
				{
					differences.delete.push(file_path);
				}
			});
		});

		_.each(files, function(file_path)
		{
			module_path = file_path.match(mod_regex) && file_path.match(mod_regex)[1];

			var is_in_manifest = false;
			
			_.each(manifest.templates.application, function(files, application)
			{
				if(_.contains(manifest.templates.application[application].files, module_path))
				{
					is_in_manifest = true;
				}
			});

			if(!is_in_manifest && !_.contains(differences.add, file_path))
			{
				differences.add.push(file_path);
			}
		});
	}
	else
	{
		differences.add = differences.add.concat(files);
	}
}

function isSkin(file_path)
{
	return file_path.toLowerCase().includes('skin');
}

function _computeConfigDiff(manifest, files, differences)
{
	var module_path;	

	if(manifest.configuration && manifest.configuration.files)
	{
		_.each(manifest.configuration.files, function(manifest_path)
		{
			var file_path = path.join(manifest.local_folder, manifest_path).replace(/\\/g, '/');
			if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
			{
				differences.delete.push(file_path);
			}
		});

		_.each(files, function(file_path)
		{
			if(!isSkin(file_path))
			{
				module_path = file_path.match(mod_regex) && file_path.match(mod_regex)[1];

				if(!_.contains(manifest.configuration.files, module_path) && 
					!_.contains(differences.add, file_path))
				{
					differences.add.push(file_path);
				}
			}
		});
	}
	else
	{
		differences.add = differences.add.concat(files);
	}
}

function _computeSkinDiff(manifest, files,differences)
{
	var module_path;	

	if(manifest.skins)
	{
		_.each(manifest.skins, function(skin_obj)
		{
			var file_path = path.join(manifest.local_folder, skin_obj.file).replace(/\\/g, '/');
			if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
			{
				differences.delete.push(file_path);
			}
		});

		_.each(files, function(file_path)
		{
			if(isSkin(file_path))
			{
				module_path = file_path.match(mod_regex) && file_path.match(mod_regex)[1];
				var index = _.findIndex(manifest.skins, function(skin){ return skin.file === module_path });

				if(index < 0 && !_.contains(differences.add, file_path))
				{
					differences.add.push(file_path);
				}
			}
		});
	}
	else
	{
		differences.add = differences.add.concat(files);
	}
}

function _computeJSDiff(manifest, files, differences)
{
	var is_js_or_ss = (manifest.javascript && manifest.javascript.application) ||
					(manifest['ssp-libraries'] && manifest['ssp-libraries'].files);

	var is_suitescript = manifest['ssp-libraries'] && manifest['ssp-libraries'].files
	,	is_javascript = manifest.javascript && manifest.javascript.application
	,	module_path
	;

	if(is_js_or_ss)
	{
		if(is_javascript)
		{
			_.each(manifest.javascript.application, function(files_data, application)
			{
				_.each(manifest.javascript.application[application].files, function(manifest_path)
				{
					var file_path = path.join(manifest.local_folder, manifest_path).replace(/\\/g, '/');

					if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
					{
						differences.delete.push(file_path);
					}
				});
			});
		}

		if(is_suitescript)
		{
			_.each(manifest['ssp-libraries'].files, function(manifest_path)
			{
				var file_path = path.join(manifest.local_folder, manifest_path).replace(/\\/g, '/');

				if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
				{
					differences.delete.push(file_path);
				}
			});
		}

		_.each(files, function(file_path)
		{
			module_path = file_path.match(mod_regex) && file_path.match(mod_regex)[1];

			var is_in_manifest = false;

			if(manifest.javascript && manifest.javascript.application)
			{
				_.each(manifest.javascript.application, function(files, application)
				{
					if(_.contains(manifest.javascript.application[application].files, module_path))
					{
						is_in_manifest = true;
					}
				});
			}	
			
			if(is_suitescript && _.contains(manifest['ssp-libraries'].files, module_path))
			{
				is_in_manifest = true;
			}

			if(!is_in_manifest && !_.contains(differences.add, file_path))
			{
				differences.add.push(file_path);
			}
		});		
	}
	else
	{
		differences.add = differences.add.concat(files);
	}
}

function _computeAssetDiff(manifest, files, differences)
{
	var module_path;

	if(manifest.assets)
	{
		_.each(manifest.assets, function(files_data, key)
		{
			_.each(manifest.assets[key].files, function(manifest_path)
			{
				var file_path = path.join(manifest.local_folder, 'assets', manifest_path).replace(/\\/g, '/');
				if(!fs.existsSync(file_path) && !_.contains(differences.delete, file_path))
				{
					differences.delete.push(file_path);
				}
			});
			
		});
		
		var asset_regex = new RegExp('\/'+ manifest.name + '\/assets\/(.*)');
		
		_.each(files, function(file_path)
		{
			module_path = file_path.match(asset_regex) && file_path.match(asset_regex)[1];
			var is_in_manifest = false;

			_.each(manifest.assets, function(files_data, key)
			{
				if(_.contains(manifest.assets[key].files, module_path))
				{
					is_in_manifest = true;
				}
			});

			if(!is_in_manifest && !_.contains(differences.add, file_path))
			{
				differences.add.push(file_path);
			}
		});
	}
	else
	{
		differences.add = differences.add.concat(files);
	}	
}

module.exports = {
	computeDifferences: computeDifferences
};