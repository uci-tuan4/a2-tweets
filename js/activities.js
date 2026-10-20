function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const completed = tweet_array.filter(tweet => tweet.source == 'completed_event');
	const counts = {};
	for (const tweet of completed) {
		const type = tweet.activityType;
		counts[type] = (counts[type] || 0) + 1;
	}
	const activityCounts = Object.keys(counts).map(type => ({activityType: type, count: counts[type]}));
	activityCounts.sort((a, b) => b.count - a.count);
	const topTypes = activityCounts.slice(0, 3).map(activity => activity.activityType);
	document.getElementById('numberActivities').innerText = activityCounts.length;
	['firstMost', 'secondMost', 'thirdMost'].forEach(function(id, index) {
		document.getElementById(id).innerText = topTypes[index] || 'N/A';
	});

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityCounts
	  },
	  "mark": "bar",
	  "width": 650,
	  "height": {"step": 22},
	  "encoding": {
	    "x": {"field": "count", "type": "quantitative", "title": "Number of tweets"},
	    "y": {"field": "activityType", "type": "nominal", "sort": "-x", "title": "Activity type"},
	    "tooltip": [{"field": "activityType", "title": "Activity"}, {"field": "count", "title": "Tweets"}]
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const distances = completed.filter(tweet => topTypes.includes(tweet.activityType) && tweet.distance > 0)
		.map(tweet => ({activityType: tweet.activityType, distance: tweet.distance, day: days[tweet.time.getUTCDay()]}));

	const distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"data": {"values": distances},
		"width": 650,
		"height": 350,
		"mark": {"type": "point", "opacity": 0.3},
		"encoding": {
			"x": {"field": "day", "type": "ordinal", "sort": days, "title": "Day of the week"},
			"y": {"field": "distance", "type": "quantitative", "title": "Distance (miles)"},
			"color": {"field": "activityType", "type": "nominal", "title": "Activity type", "scale": {"domain": topTypes}},
			"tooltip": [
				{"field": "day", "title": "Day"},
				{"field": "activityType", "title": "Activity"},
				{"field": "distance", "type": "quantitative", "format": ".2f", "title": "Miles"}
			]
		}
	};
	const mean_vis_spec = {
		...distance_vis_spec,
		"mark": {"type": "line", "point": true},
		"encoding": {
			...distance_vis_spec.encoding,
			"y": {"aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Mean distance (miles)"},
			"tooltip": [
				{"field": "day", "title": "Day"},
				{"field": "activityType", "title": "Activity"},
				{"aggregate": "mean", "field": "distance", "type": "quantitative", "format": ".2f", "title": "Mean miles"}
			]
		}
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions: false});
	vegaEmbed('#distanceVisAggregated', mean_vis_spec, {actions: false});

	const means = topTypes.map(function(type) {
		const activities = distances.filter(activity => activity.activityType == type);
		const total = activities.reduce((sum, activity) => sum + activity.distance, 0);
		return {type: type, mean: activities.length ? total / activities.length : null};
	}).filter(activity => activity.mean !== null);
	means.sort((a, b) => b.mean - a.mean);
	document.getElementById('longestActivityType').innerText = means.length ? means[0].type : 'N/A';
	document.getElementById('shortestActivityType').innerText = means.length ? means[means.length - 1].type : 'N/A';

	const weekend = distances.filter(activity => activity.day == 'Saturday' || activity.day == 'Sunday');
	const weekdays = distances.filter(activity => activity.day != 'Saturday' && activity.day != 'Sunday');
	let longer = 'N/A';
	if (weekend.length && weekdays.length) {
		const weekendMean = weekend.reduce((sum, activity) => sum + activity.distance, 0) / weekend.length;
		const weekdayMean = weekdays.reduce((sum, activity) => sum + activity.distance, 0) / weekdays.length;
		longer = weekendMean == weekdayMean ? 'weekdays and weekends equally' : weekendMean > weekdayMean ? 'weekends' : 'weekdays';
	}
	document.getElementById('weekdayOrWeekendLonger').innerText = longer;

	const rawChart = document.getElementById('distanceVis');
	const meanChart = document.getElementById('distanceVisAggregated');
	const button = document.getElementById('aggregate');
	let showMeans = false;
	rawChart.hidden = false;
	meanChart.hidden = true;
	button.innerText = 'Show means';
	button.onclick = function() {
		showMeans = !showMeans;
		rawChart.hidden = showMeans;
		meanChart.hidden = !showMeans;
		button.innerText = showMeans ? 'Show individual activities' : 'Show means';
	};
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
