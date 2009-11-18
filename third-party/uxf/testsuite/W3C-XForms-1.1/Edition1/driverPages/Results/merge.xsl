<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
	version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xalan="http://xml.apache.org/xslt"
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
	xmlns:xforms="http://www.w3.org/2002/xforms"
	xmlns:ts="http://www.w3c.org/MarkUp/Forms/XForms/Test/11"
	xmlns:exslt_dt="http://exslt.org/dates-and-times"
>
	<!-- 
		For each manually produced test result: Open the selenium produced test result and compare
		the test 'Passed' or 'Failed' value, updating the value and test date as needed.
	-->
	
	<!-- 
		Parameters
		
		browser = 'ie'|'ff' etc.
		selenium_file_dir = 'IE7'|'FF3' etc.
	-->
	<xsl:param name="browser" />
	<xsl:param name="selenium_file_dir" />
	
	<!-- 
		Output type
	-->	
	<xsl:output 
		method="xml" 
		encoding="UTF-8" 
		indent="yes" 
		omit-xml-declaration="no" 
		xalan:indent-amount="4"
	/>
	
	<!-- 
		Create the merged XML document
		
		This could just be an xsl:copy?
		
		xforms11-Chapter2-ie-results.html
		xforms11-AppendixH-ie-results.html
	-->
	<xsl:template match="/ts:testSuite">
		<xsl:variable name="is_appendix" select="boolean(contains(ts:specChapter/ts:testCase[1]/ts:testCaseLink, 'Appendix'))" /><!-- Horrible. But no other info about whether file being transformed is a chapter or an appendix -->
		
		<testSuite 
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
			xsi:schemaLocation="http://www.w3c.org/MarkUp/Forms/XForms/Test/11 XF11TestSuite.xsd" 
			specVersion="1.1" xmlns="http://www.w3c.org/MarkUp/Forms/XForms/Test/11"
		>
			<specChapter chapterName="{ts:specChapter/@chapterName}" productId="{ts:specChapter/productId}" chapterTitle="{ts:specChapter/@chapterTitle}">
				<xsl:apply-templates select="ts:specChapter/ts:statusSummary" />
				<xsl:apply-templates select="ts:specChapter/ts:profile" />
				<xsl:for-each select="ts:specChapter/ts:testCase">
					<!-- 
						Chapter xsl:if (different filename to load with document()).
					-->
					<xsl:if test="not($is_appendix)">
						<!-- 
							The Selenium tests way of indicating that the test passed or failed is by setting the background colour of 
							a table cell to red or green. There is no 'this test passed' value available, so this is the value we have
							to use to determine what Selenium thinks the test did.
						-->
						<xsl:variable name="selenium_test_case_result" select="document(concat($selenium_file_dir, '/', 'xforms11-Chapter', substring-before(/ts:testSuite/ts:specChapter/@chapterName, '.'), '-', $browser, '-results.html'))//xhtml:table[@id = 'suiteTable']/xhtml:tbody/xhtml:tr[contains(xhtml:td/xhtml:a, current()/ts:testCaseName)]/@bgcolor" />
	
						<!-- 
							Merge the developer manually entered <testCase> data in the input doc with the selenium test result data if needed
						-->
						<testCase>
							<testCaseSection><xsl:value-of select="ts:testCaseSection"/></testCaseSection>
							<testCaseName><xsl:value-of select="ts:testCaseName"/></testCaseName>
							<testCaseLink><xsl:value-of select="ts:testCaseLink"/></testCaseLink>
							<testCaseDescription><xsl:value-of select="ts:testCaseDescription"/></testCaseDescription>
							<testCaseSpecLinkName><xsl:value-of select="ts:testCaseSpecLinkName"/></testCaseSpecLinkName>
							<testCaseSpecLink><xsl:value-of select="ts:testCaseSpecLink"/></testCaseSpecLink>
							<testCaseBasic><xsl:value-of select="ts:testCaseBasic"/></testCaseBasic>
							<testCaseNormative><xsl:value-of select="ts:testCaseNormative"/></testCaseNormative>
							<!-- 
								#CCFFCC = Passed
								#FFCCCC = Failed
								
								Only need to update the success value (<testCaseStatus />) if selenium is 'Passed' (or equiv. of) and manual is 'Failed'. 
								Only need to update the date value (<testCaseDate />) when the success value is updated.
								
								Note: With Ant 1.7 download that uses Xalan. The exslt date function month-in-year() seems to return a zero-based month.
								I'm not sure this is correct as according to https://issues.apache.org/jira/browse/XALANJ-2076 it's a fixed bug in Xalan
								2.7. I cannot find how to get hold of the Xalan version from Ant to establish what version it's using. As we are using 
								a default install of Ant and the function return the zero-based number, I shall be adding 1. (BTW, in a separate test with 
								Saxon 655, the function returns one-based month values).
							-->
							<xsl:choose>
								<xsl:when test="$selenium_test_case_result = '#CCFFCC' and not(ts:testCaseStatus = 'Passed')">
									<testCaseStatus>Passed</testCaseStatus>
									<testCaseDate><xsl:value-of select="concat(exslt_dt:year(), '-', format-number(exslt_dt:month-in-year() + 1, '00'), '-', exslt_dt:day-in-month())" /></testCaseDate>
								</xsl:when>
								<xsl:otherwise>
									<testCaseStatus><xsl:value-of select="ts:testCaseStatus"/></testCaseStatus>
									<testCaseDate><xsl:value-of select="ts:testCaseDate"/></testCaseDate>
								</xsl:otherwise>
							</xsl:choose>
							<testCaseRequired><xsl:value-of select="ts:testCaseRequired"/></testCaseRequired>
							<testCaseNote><xsl:value-of select="ts:testCaseNote"/></testCaseNote>
						</testCase>
					</xsl:if>
					
					<!-- 
						Appendix
					-->
					<xsl:if test="$is_appendix">
						<xsl:variable name="selenium_test_case_result" select="document(concat($selenium_file_dir, '/', 'xforms11-Appendix', substring-before(/ts:testSuite/ts:specChapter/@chapterName, '.'), '-', $browser, '-results.html'))//xhtml:table[@id = 'suiteTable']/xhtml:tbody/xhtml:tr[contains(xhtml:td/xhtml:a, current()/ts:testCaseName)]/@bgcolor" />
						<testCase>
							<testCaseSection><xsl:value-of select="ts:testCaseSection"/></testCaseSection>
							<testCaseName><xsl:value-of select="ts:testCaseName"/></testCaseName>
							<testCaseLink><xsl:value-of select="ts:testCaseLink"/></testCaseLink>
							<testCaseDescription><xsl:value-of select="ts:testCaseDescription"/></testCaseDescription>
							<testCaseSpecLinkName><xsl:value-of select="ts:testCaseSpecLinkName"/></testCaseSpecLinkName>
							<testCaseSpecLink><xsl:value-of select="ts:testCaseSpecLink"/></testCaseSpecLink>
							<testCaseBasic><xsl:value-of select="ts:testCaseBasic"/></testCaseBasic>
							<testCaseNormative><xsl:value-of select="ts:testCaseNormative"/></testCaseNormative>
							<xsl:choose>
								<xsl:when test="$selenium_test_case_result = '#CCFFCC' and not(ts:testCaseStatus = 'Passed')">
									<testCaseStatus>Passed</testCaseStatus>
									<testCaseDate><xsl:value-of select="concat(exslt_dt:year(), '-', format-number(exslt_dt:month-in-year() + 1, '00'), '-', exslt_dt:day-in-month())" /></testCaseDate>
								</xsl:when>
								<xsl:otherwise>
									<testCaseStatus><xsl:value-of select="ts:testCaseStatus"/></testCaseStatus>
									<testCaseDate><xsl:value-of select="ts:testCaseDate"/></testCaseDate>
								</xsl:otherwise>
							</xsl:choose>
							<testCaseRequired><xsl:value-of select="ts:testCaseRequired"/></testCaseRequired>
							<testCaseNote><xsl:value-of select="ts:testCaseNote"/></testCaseNote>
						</testCase>
					</xsl:if>
				</xsl:for-each>
			</specChapter>
		</testSuite>
	</xsl:template>

	<!-- 
		Copy through these elements and their children as-is
	-->
	<xsl:template match="ts:statusSummary | ts:profile">
		<xsl:copy>
			<xsl:copy-of select="@*" />
			<xsl:apply-templates />
		</xsl:copy>
	</xsl:template>
	
	<!-- 
		Identity transform
	-->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()" />
		</xsl:copy>
	</xsl:template>	
</xsl:stylesheet>