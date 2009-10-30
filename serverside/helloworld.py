import cgi
import urllib2

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.api import urlfetch
from google.appengine.ext.webapp.util import run_wsgi_app

class MainPage(webapp.RequestHandler):
  def get(self):
    self.response.out.write("""
      <html>
        <body>
          <form action="/navigate" method="get">
            <div><input name="uri" rows="3" cols="60"></input></div>
            <div><input type="submit" value="URI"></div>
          </form>
        </body>
      </html>""")


class Navigate(webapp.RequestHandler):
  def get(self):
    uri = self.request.get('uri')
    try:
      result = urllib2.urlopen(uri)
      self.response.out.write(result.read())
    except urllib2.URLError, e:
      self.response.out.write("<html><body>Exception</body></html>")

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/navigate', Navigate)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
