(function(){
	var App = new (Backbone.View.extend({
		rcolor: new RColor(),
		ralphacolor: function(alpha){
			var _colors = this.rcolor.get();
			var _ret = 'rgba(';
			_.each(_colors, function(v){
				_ret += v + ',';
			});
			_ret += alpha + ')';
			return _ret;
		},
		checkAuth: function(callback){
			(new App.Models.Auth).fetch({
				success: function(model, response, options){
					return callback(true);
				},
				error: function(model, response, options){
					return callback(false);
				}
			});
		},
		pieDesc: function(name){
			name || (name = '');
			var ret = {
				water: false, coffee: false, 
				beer: false, other: false
			};
			switch(name.toLowerCase()){
				case 'water': 
					ret.water = true; break;
				case 'coffee':
					ret.coffee = true; break;
				case 'beer':
					ret.beer = true; break;
				default:
					ret.other = true;
			}
			return ret;
		},
		radarDesc: function(max){
			var ret = {};
			ret.night = (max['night'])? 
					max['night'].name + ' (' + max['night'].value + 'mL)'
					: 'nothing';
			ret.day = (max['day'])? 
					max['day'].name + ' (' + max['day'].value + 'mL)'
					: 'nothing';
			return ret;
		},
		lineDesc: function(totals, max){
			var ret = {};
			ret.totals = '';
			_.each(totals, function(item){
				ret.totals += '<span style="color:' + item.color + '">';
				ret.totals += item.value + 'mL of ' + item.name + '</span><br>';
			});
			ret.note = {};
			if (totals[0]) {
				ret.note.same = (totals[0].name === max);
				if (ret.note.same) {
					ret.note.max = max;
				} else {
					ret.note.max = max;
					ret.note.big = totals[0].name;
				}
			} else {
				ret.note.other = true;
			}
			return ret;
		},
		router: new (Backbone.Router.extend({
			routes: {
				''			: 'dashBoard',
				'/'			: 'dashBoard',
				'dashboard'	: 'dashBoard',
				'faq'		: 'faq'
			},
			faq: function(){
				App.setView(new App.Views.Faq);
			},
			dashBoard: function(){
				var _drinks = new App.Collections.Drinks([], {
					model: App.Models.Drink
				});
				_drinks.fetch({
					success: function(){
						$('.logout').removeClass('hide');
						App.setView(new App.Views.Drinks({
							collection: _drinks
						}));
					},
					error: function(collection, response, options){
						App.setView(new App.Views.Error({
							detail: response.statusText
						}));
					}
				});
			},
		})),
		Models: {
			Drink: Backbone.Model.extend({
				defaults: function(){
					return {
						vol: 0, volUnit: 'ml',
						type: 'water', 
						date: moment().format('MM-DD-YYYY'),
						time: moment().format('hh:mm:a')
					};
				}
			})
		},
		Collections: {
			Drinks: Backbone.Collection.extend({
				initialize: function(){
					this.on('add', this.checkSize);
				},
				checkSize: function(){
					if (this.models.length > 25) {
						this.models = _.last(this.models, 25);
					}
				},
				localStorage: new Backbone.LocalStorage('drinks'),
				comparator: function(drink1, drink2){
					if (drink1.get('date') == drink2.get('date')){
						return drink1.get('time') < drink2.get('time');
					}else{
						return drink1.get('date') < drink2.get('date');
					}
				},
				count: function(){
					var types = {'water': 0, 'coffee': 1, 'beer': 2};
					var ret = {};
					ret.pie = [];

					// first chart
					_.each(_.groupBy(this.models, function(item){
							return item.get('type');
						}), function(v, k, l){
							ret.pie.push({
								'value': v.length,
								'color': App.rcolor.get(true),
								'name': k,
							});
					});
					ret.pie.maxType = _.max(ret.pie, function(item){return item.value});

					// second chart
					var day = 0, night = 1;
					ret.radar = {
						labels: _.keys(types), 
						datasets: [
							{
								fillColor : App.ralphacolor(0.5),
								strokeColor : App.ralphacolor(0.5),
								pointColor : App.ralphacolor(0.5),
								pointStrokeColor : '#fff',
								data: []
							},
							{
								fillColor : App.rcolor.get(true),
								strokeColor : App.rcolor.get(true),
								pointColor : App.rcolor.get(true),
								pointStrokeColor : '#fff',
								data: []
							}
						]
					};
					ret.radar.max = {};
					_.each(_.groupBy(this.models, function(item){
							var sign = item.get('time').split(':')[2];
							return ((sign === 'pm')? night:day);
					}), function(v, k, l){
						var _group = _.groupBy(v, function(item){ return item.get('type') });
						var total = [];
						_.each(ret.radar.labels, function(v, i, l){
							var number = 0;
							_.each(_group[v], function(v, i, l){
								number += (+v.get('vol')) * ((v.get('volUnit') == 'mL')? 1:1000);
							});
							ret.radar.datasets[k].data.push(number);
							total.push({
								name: v, value: number
							});
						});
						ret.radar.max[(k == 0)? 'day' : 'night'] = _.max(total, function(item){
							return item.value;
						});
					});
					var dayLen = ret.radar.datasets[day].data.length;
					var nightLen = ret.radar.datasets[night].data.length;
					if (dayLen < nightLen) {
						var diff = nightLen - dayLen;
						while (--diff >= 0) { ret.radar.datasets[day].data.push(0); }
					} else if (nightLen < dayLen) {
						var diff = dayLen - nightLen;
						while (--diff >= 0) { ret.radar.datasets[night].data.push(0); }
					}

					// last chart
					ret.bar = {
						datasets: [
							{
								fillColor : App.ralphacolor(0.5),
								strokeColor : App.ralphacolor(0.5),
								data: []
							}
						]
					};
					var _group = _.groupBy(this.models, function(item){
						return item.get('type');
					});
					ret.bar.totals = [];
					ret.bar.labels = [];
					_.each(_group, function(v, k, l){
						var _total = 0;
						ret.bar.labels.push(k);
						_.each(v, function(v, i, l){
							var _vol = v.get('vol') * ((v.get('volUnit') == 'mL')? 1:1000);
							_total += _vol;
						});
						ret.bar.datasets[0].data.push(_total);
						ret.bar.totals.push({
							name: k, 
							color: ret.bar.datasets[0].fillColor,
							value: _total
						});
					});
					ret.bar.totals = _.sortBy(ret.bar.totals, function(item){
						return -item.value;
					});
					return ret;
				}
			})
		},
		Views: {
			Error: Backbone.View.extend({
				template: Mustache.compile($('#error:first').html()),
				render: function(){
					this.$el.html(this.template({
						detail: this.detail
					}));
					return this;
				}
			}),
			Drinks: Backbone.View.extend({
				initialize: function(options){
					var self = this;
					options = options || {};
					this.collection = options.collection 
						|| new App.Collections.Drink;
				},
				className: 'list-drink',
				events: {
					'keypress .vol': 'onSubmit',
					'click button.submit': 'onSubmit',
					'click button.bootstrap': 'bootstrap'
				},
				onSubmit: function(e){
					if (e != null){
						if (e.type == 'keypress' && e.keyCode != 13) 
							return;
						else if (e.type == 'mousedown')
							e.preventDefault();
					}
					// cache el query
					var volInput = this.$('input#vol');
					// create new model ins and its view
					var _this = this;
					this.collection.create({
						vol: volInput.val(),
						volUnit: this.$('select#volUnit').val(),
						type: this.$('select#type').val()
					}, {
						wait: true,
						success: function(){
							_this.render();
						},
						error: function(model, xhr, options){
							App.setView(new App.Views.Error({
								detail: xhr.status+' '+xhr.statusText
							}));
						}
					});
				},
				bootstrap: function(e){
					e.preventDefault();
					var types = ['water', 'coffee', 'beer'];
					for (var i = 0; i < 5; i++){
						this.collection.create({
							vol: _.random(100, 500),
							volUnit: 'mL',
							type: types[_.random(0, 2)]
						});
					}
					this.render();
				},
				template: Mustache.compile($('#dashboard:first').html()),
				getContext: function(identifier){
					return this.$(identifier).get(0).getContext('2d');
				},
				render: function(){
					var data = this.collection.count();
					data['notePie'] = App.pieDesc(data.pie.maxType.name);
					data['noteRadar'] = App.radarDesc(data.radar.max);
					data['noteLine'] = App.lineDesc(data.bar.totals, data.pie.maxType.name);
					this.$el.html(this.template(data));

					var overallChart = new Chart(this.getContext('#overall-chart'));
					overallChart.Doughnut(data.pie, {});
					
					var timeChart = new Chart(this.getContext('#time-chart'));
					timeChart.Radar(data.radar, {
						scaleShowLabels : true,
						scaleLabel : "<%=value%> mL",
					});

					var seriesChart = new Chart(this.getContext('#series-chart'));
					seriesChart.Bar(data.bar, {
						scaleShowLabels : true,
						scaleLabel : "<%=value%> mL",
					});
					return this;
				}
			})
		},
		initialize: function(){
			this.childEl = this.$el.children('div.content:first');
		},
		el: $('div.main:first'),
		// childEl: this.$('div.content'),
		setView: function(view){
			if (this.view) this.view.remove();
			this.view = view;
			this.$el.html(this.view.render().el);
		},
		start: function(){
			console.log('start');
			Backbone.history.start({pushState:true});
			this.router.navigate('dashboard', {trigger:true});
		}
	}));

	App.start();
}());