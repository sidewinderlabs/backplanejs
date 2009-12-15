#!/usr/bin/env python
#
# Copyright 2009 Mark Birbeck
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

from BeautifulSoup import BeautifulSoup, Tag
import re
import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch

class MainPage(webapp.RequestHandler):

    def get(self):
        self.response.headers['Content-Type'] = 'text/html'

        url = self.request.get('url')

        result = urlfetch.fetch(url=url, allow_truncated=True, deadline=10)
        if result.status_code == 200:
            soup = BeautifulSoup(result.content)
            if soup.base == None:
                base = Tag(soup, 'base')
                base['href'] = url
                soup.head.insert(0, base)

            script = Tag(soup, 'iframe')
            script['src'] = 'http://backplanejs.appspot.com/rdfa-viewer.html'
            script['style'] = 'background-color: transparent; width: 100%; height: 300px; padding: 0; margin: 0; overflow: hidden; position: fixed; bottom: 0; left: 0; border: 0; z-index: 999; '
            script['frameborder'] = '0'
            script['hspace'] = '0'
            script['vspace'] = '0'
            script['scrolling'] = 'no'
            script['allowtransparency'] = 'yes'
            soup.body.insert(0, script)

            self.response.out.write(soup.renderContents())

application = webapp.WSGIApplication(
                                     [('/rdfa', MainPage)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()

