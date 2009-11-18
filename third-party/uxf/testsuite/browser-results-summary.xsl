<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	version="1.0"
	xmlns:xalan="http://xml.apache.org/xslt"
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
	xmlns:ts="http://www.w3c.org/MarkUp/Forms/XForms/Test/11"
	exclude-result-prefixes="xalan xhtml ts"
>
	<!-- 
		This XSL was written to run on 'testsuite/W3C-XForms-1.1/Edition1/driverPages/html/index.html'
	-->
	
	<!-- 
		Outputting X(HT)ML
	-->
	<xsl:output 
		method="xml"
		encoding="UTF-8"
		indent="yes"
		omit-xml-declaration="yes"
		xalan:indent-amount="4"
		doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
	/>
	
	<!-- 
		Params to construct links from
	-->
	<xsl:param name="url" />
	<xsl:param name="browser_dir" />

	<!-- 
		URL to a specific browsers' results
	-->
	<xsl:variable name="chap_results_base_url" select="concat($url, $browser_dir)" />
	
	<!-- 
		Match doc element and produce some XHTML output
	-->
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>Testsuite Browser Results Summary</title>
				<style type="text/css">
					.chapter-summary {margin-bottom:10px;}
					.chapter-name {}
					.results-summary-table {}
					.highlight {font-weight:900;}
					.pass {background-color:lightgreen;}
					.fail {background-color:red;}
				</style>
			</head>
			<body>
				<h1>
				<xsl:choose>
					<xsl:when test="contains($browser_dir, 'FF3')">FireFox 3 Testsuite Results Summary</xsl:when>
					<xsl:when test="contains($browser_dir, 'IE7')">Internet Explorer 7 Testsuite Results Summary</xsl:when>
					<xsl:otherwise>Testsuite Results Summary</xsl:otherwise>
				</xsl:choose>
				</h1>
				<xsl:apply-templates />
				<xsl:call-template name="chapter-totals" />
			</body>
		</html>	
	</xsl:template>
	
	<!-- 
		Match the links as they contain the test suite chapter names and output a link to the 'full details' doc.
	-->
	<xsl:template match="xhtml:a">
		<div class="chapter-summary">
			<xsl:choose>
				<xsl:when test="not(format-number(substring-before(., '.'), '00') = 'NaN')">
					<div class="chapter-name">
						<xsl:choose>
							<xsl:when test="$url = './'">
								<a href="XF11_{format-number(substring-before(., '.'), '00')}_Results.html"><xsl:value-of select="concat('Chapter ', .)" /></a>
							</xsl:when>
							<xsl:otherwise>
								<a href="{$chap_results_base_url}/XF11_{format-number(substring-before(., '.'), '00')}_Results.html"><xsl:value-of select="concat('Chapter ', .)" /></a>
							</xsl:otherwise>
						</xsl:choose>
					</div>
					<xsl:call-template name="chapter-summary">
						<xsl:with-param name="results_doc_name" select="concat('W3C-XForms-1.1/Edition1/driverPages/Results/', $browser_dir, '/', 'XF11_', format-number(substring-before(., '.'), '00'), '_Results.xml')" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<div class="chapter-name">
						<xsl:choose>
							<xsl:when test="$url = './'">
								<a href="XF11_Appendix{substring-before(., '.')}_Results.html"><xsl:value-of select="concat('Appendix ', .)" /></a>
							</xsl:when>
							<xsl:otherwise>
								<a href="{$chap_results_base_url}/XF11_Appendix{substring-before(., '.')}_Results.html"><xsl:value-of select="concat('Appendix ', .)" /></a>
							</xsl:otherwise>
						</xsl:choose>
					</div>
					<xsl:call-template name="chapter-summary">
						<xsl:with-param name="results_doc_name" select="concat('W3C-XForms-1.1/Edition1/driverPages/Results/', $browser_dir, '/', 'XF11_Appendix', substring-before(., '.'), '_Results.xml')" />
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</div>
	</xsl:template>

	<!-- 
		Load a results file for a chapter, count the passed/failed values and summarise in a <table>.
		W3C-XForms-1.1/Edition1/driverPages/Results/<browser>/<chapter>.xml
	-->
	<xsl:template name="chapter-summary">
		<xsl:param name="results_doc_name" />
		<xsl:variable name="doc" select="document($results_doc_name)" />

		<xsl:variable name="basic_tests" select="$doc/ts:testSuite/ts:specChapter/ts:testCase[ts:testCaseBasic = 'true']" />
		<xsl:variable name="no_basic_tests_pass" select="count($basic_tests[ts:testCaseStatus = 'Passed'])" />
		<xsl:variable name="no_basic_tests_fail" select="count($basic_tests[ts:testCaseStatus = 'Failed'])" />

		<xsl:variable name="normative_tests" select="$doc/ts:testSuite/ts:specChapter/ts:testCase[ts:testCaseNormative = 'true']" />
		<xsl:variable name="no_normative_tests_pass" select="count($normative_tests[ts:testCaseStatus = 'Passed'])" />
		<xsl:variable name="no_normative_tests_fail" select="count($normative_tests[ts:testCaseStatus = 'Failed'])" />

		<table class="results-summary-table" width="700">
			<tr>
				<td width="500"><span class="highlight"><xsl:value-of select="count($normative_tests)" /> NORMATIVE</span> tests</td>
				<td class="pass"><xsl:value-of select="$no_normative_tests_pass"/> passed</td>
				<td class="fail"><xsl:value-of select="$no_normative_tests_fail" /> failed</td>
			</tr>
			<tr>
				<td width="500"><span class="highlight"><xsl:value-of select="count($basic_tests)" /> BASIC</span> tests</td>
				<td class="pass"><xsl:value-of select="$no_basic_tests_pass"/> passed</td>
				<td class="fail"><xsl:value-of select="$no_basic_tests_fail" /> failed</td>
			</tr>
		</table>
	</xsl:template>

	<!-- 
		Total across all chapters.
	-->
	<xsl:template name="chapter-totals">
		<xsl:variable name="normative-tests"
			select="document(
				document(concat('W3C-XForms-1.1/Edition1/driverPages/Results/', $browser_dir, '/test-list.html'))//xhtml:a/@href
			)/ts:testSuite/ts:specChapter/ts:testCase[ts:testCaseNormative = 'true']"
		/>
		<xsl:variable name="basic-tests"
			select="document(
			document(concat('W3C-XForms-1.1/Edition1/driverPages/Results/', $browser_dir, '/test-list.html'))//xhtml:a/@href
			)/ts:testSuite/ts:specChapter/ts:testCase[ts:testCaseBasic = 'true']"
		/>
		<p>
			<h1>Totals</h1>
			<em>Note that these totals don't include chapter 1, or appendices G and H.</em>
			<table class="results-summary-table" width="800">
				<tr>
					<td width="500"><span class="highlight"><xsl:value-of select="count($normative-tests)" /> NORMATIVE</span> tests</td>
					<td class="pass"><xsl:value-of select="count($normative-tests[ts:testCaseStatus = 'Passed'])"/> passed</td>
					<td class="fail"><xsl:value-of select="count($normative-tests[ts:testCaseStatus = 'Failed'])" /> failed</td>
					<td class="percent"><xsl:value-of select="format-number(count($normative-tests[ts:testCaseStatus = 'Passed']) div count($normative-tests), '##%')" /></td>
				</tr>
				<tr>
					<td width="500"><span class="highlight"><xsl:value-of select="count($basic-tests)" /> BASIC</span> tests</td>
					<td class="pass"><xsl:value-of select="count($basic-tests[ts:testCaseStatus = 'Passed'])"/> passed</td>
					<td class="fail"><xsl:value-of select="count($basic-tests[ts:testCaseStatus = 'Failed'])" /> failed</td>
					<td class="percent"><xsl:value-of select="format-number(count($basic-tests[ts:testCaseStatus = 'Passed']) div count($basic-tests), '##%')" /></td>
				</tr>
			</table>
		</p>
	</xsl:template>
	
	<!-- 
		Ignore these
	-->
	<xsl:template match="xhtml:head | xhtml:h1 | xhtml:p/xhtml:a" />
</xsl:stylesheet>
