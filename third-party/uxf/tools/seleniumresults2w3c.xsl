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
	<xsl:param name="browser" />
	<xsl:param name="selenium_file_dir" />
	<xsl:param name="chapter" />

	<xsl:output 
		method="xml" 
		encoding="UTF-8" 
		indent="yes" 
		omit-xml-declaration="no" 
		xalan:indent-amount="4"
	/>
	
	<xsl:template match="/ts:testSuite">
		<xsl:variable name="is_appendix" select="boolean(contains(ts:specChapter/ts:testCase[1]/ts:testCaseLink, 'Appendix'))" />
		
		<testSuite 
		 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
		 xsi:schemaLocation="http://www.w3c.org/MarkUp/Forms/XForms/Test/11 XF11TestSuite.xsd" 
		 specVersion="1.1" xmlns="http://www.w3c.org/MarkUp/Forms/XForms/Test/11"
		>
			<specChapter chapterName="{ts:specChapter/@chapterName}" productId="{ts:specChapter/productId}" chapterTitle="{ts:specChapter/@chapterTitle}">
				<xsl:apply-templates select="ts:specChapter/ts:statusSummary" />
				<xsl:apply-templates select="ts:specChapter/ts:profile" />
				<xsl:for-each select="ts:specChapter/ts:testCase">
					<testCase>
						<testCaseSection><xsl:value-of select="ts:testCaseSection"/></testCaseSection>
						<testCaseName><xsl:value-of select="ts:testCaseName"/></testCaseName>
						<testCaseLink><xsl:value-of select="ts:testCaseLink"/></testCaseLink>
						<testCaseDescription><xsl:value-of select="ts:testCaseDescription"/></testCaseDescription>
						<testCaseSpecLinkName><xsl:value-of select="ts:testCaseSpecLinkName"/></testCaseSpecLinkName>
						<testCaseSpecLink><xsl:value-of select="ts:testCaseSpecLink"/></testCaseSpecLink>
						<testCaseBasic><xsl:value-of select="ts:testCaseBasic"/></testCaseBasic>
						<testCaseNormative><xsl:value-of select="ts:testCaseNormative"/></testCaseNormative>

						<xsl:if test="not($is_appendix)">
							<xsl:variable name="selenium_test_case_result" select="document(concat($selenium_file_dir, '/', 'xforms11-Chapter', $chapter, '-', $browser, '-results.html'))//xhtml:table[@id = 'suiteTable']/xhtml:tbody/xhtml:tr[contains(xhtml:td/xhtml:a, current()/ts:testCaseName)]/@class" />
		
							<xsl:choose>
								<xsl:when test="contains($selenium_test_case_result, 'status_passed')">
									<testCaseStatus>Passed</testCaseStatus>
								</xsl:when>
								<xsl:otherwise>
									<testCaseStatus>Failed</testCaseStatus>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:if>

						<xsl:if test="$is_appendix">
							<xsl:variable name="selenium_test_case_result" select="document(concat($selenium_file_dir, '/', 'xforms11-Appendix', substring-before(/ts:testSuite/ts:specChapter/@chapterName, '.'), '-', $browser, '-results.html'))//xhtml:table[@id = 'suiteTable']/xhtml:tbody/xhtml:tr[contains(xhtml:td/xhtml:a, current()/ts:testCaseName)]/@class" />

							<xsl:choose>
								<xsl:when test="contains($selenium_test_case_result, 'status_passed')">
									<testCaseStatus>Passed</testCaseStatus>
								</xsl:when>
								<xsl:otherwise>
									<testCaseStatus>Failed</testCaseStatus>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:if>

						<testCaseDate><xsl:value-of select="concat(exslt_dt:year(), '-', format-number(exslt_dt:month-in-year(), '00'), '-', format-number(exslt_dt:day-in-month(), '00'))" /></testCaseDate>
						<testCaseRequired><xsl:value-of select="ts:testCaseRequired"/></testCaseRequired>
						<testCaseNote><xsl:value-of select="ts:testCaseNote"/></testCaseNote>
					</testCase>
					
				</xsl:for-each>
			</specChapter>
		</testSuite>
	</xsl:template>

	<xsl:template match="ts:statusSummary | ts:profile">
		<xsl:copy>
			<xsl:copy-of select="@*" />
			<xsl:apply-templates />
		</xsl:copy>
	</xsl:template>
	
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()" />
		</xsl:copy>
	</xsl:template>	
</xsl:stylesheet>