<%@ Page Language="C#" %>
<%@ Import Namespace="System.Xml" %>
<%@ Import Namespace="System.IO" %>
<script language="C#" runat="server">
	private void Page_Load(object sender, System.EventArgs e)
	{
		Response.ContentType = "text/xml";
		
		try 
		{
			StreamReader reader = new StreamReader(Request.InputStream);
			String data = reader.ReadToEnd();
			
			XmlDocument doc = new XmlDocument();
			doc.LoadXml(data);
			
			Response.Write(doc.InnerXml);
		} 
		catch(Exception ex) 
		{
			Response.Write("<exception>" + ex.ToString() + "</exception>");
		}
	}
</script>