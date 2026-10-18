class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const text = this.text.toLowerCase().trim();
        if (text.startsWith('watch my ') && text.includes('right now')) {
            return 'live_event';
        }
        if (text.startsWith('achieved a new ') || text.startsWith('i just set a goal')) {
            return 'achievement';
        }
        if (text.startsWith('just completed ') || text.startsWith('just posted ') ||
            text.startsWith('completed a ') || text.startsWith('i just completed ') ||
            text.startsWith('i just ran with ')) {
            return 'completed_event';
        }
        return 'miscellaneous';
    }

    get written():boolean {
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        let text = this.text.replace(/https?:\/\/\S+/gi, '')
            .replace(/#Runkeeper\b/gi, '').trim();

        if (this.source == 'completed_event') {
            const descriptionStart = text.indexOf(' - ');
            if (descriptionStart == -1) {
                return '';
            }
            text = text.substring(descriptionStart + 3);
            text = text.replace(/^TomTom MySports Watch\s*/i, '')
                .replace(/with @Runkeeper\.\s*Check it out!/gi, '');
        } else if (this.source == 'live_event' || this.source == 'achievement' ||
                   text.toLowerCase().startsWith('just linked ')) {
            return '';
        }
        return text.trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}
