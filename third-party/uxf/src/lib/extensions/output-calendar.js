/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var OutputValueCalendar = new UX.Class({
	
	initialize: function(count) {
		this.m_value = new YAHOO.widget.Calendar("ux-calendar-" + count, "ux-calendar-bg" + count);
	},

	setValue: function(sValue) {
		if (!sValue.match(/^(\d{4})\-(\d{2})\-(\d{2})/)) return false;
		
		var yr = RegExp.$1;
		var mn = RegExp.$2;
		var da = RegExp.$3;
		var calendarDate = mn + '/' + da + '/' + yr; // default format used by the calendar implementation
		if (this.m_value) { // avoid race when popup
			this.m_value.setYear(yr);
			this.m_value.setMonth(mn - 1);
			this.m_value.cfg.setProperty("mindate", calendarDate, false);
			this.m_value.cfg.setProperty("maxdate", calendarDate, false);
			this.m_value.select(calendarDate);
		}
		return true;
	},

	render: function() {
		this.m_value.render();
	}

});
