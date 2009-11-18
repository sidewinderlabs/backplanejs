<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
	version='1.0'
	xmlns:xsl='http://www.w3.org/1999/XSL/Transform'
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
	xmlns:xforms="http://www.w3.org/2002/xforms"
    xmlns:ts="http://www.w3c.org/MarkUp/Forms/XForms/Test/11"
>
	<!--
		
		Transformation to a test suite chapter results XML files into an XML file
		containing summary statistics for that chapter.
		
	-->
	
	<!--
		Ouput options.
	-->
	<xsl:output 
		method="xml" 
		encoding="UTF-8" 
		indent="yes" 
		omit-xml-declaration="no" 
	/>
	
	<!-- 
		Generate the chapter counts
	-->
	<xsl:template match="/ts:testSuite">
        <chapterCounts xmlns="">
            <numNormTotal><xsl:value-of select="count(ts:specChapter/ts:testCase[ts:testCaseNormative = 'true'])"/></numNormTotal>
            <numNormPass><xsl:value-of select="count(ts:specChapter/ts:testCase[ts:testCaseNormative = 'true'][ts:testCaseStatus = 'Passed'])"/></numNormPass>
            <numNormFail><xsl:value-of select="count(ts:specChapter/ts:testCase[ts:testCaseNormative = 'true'][ts:testCaseStatus = 'Failed'])"/></numNormFail>
            <numNormUnknown>not calculated</numNormUnknown>
            <numBasicTotal><xsl:value-of select="count(ts:specChapter/ts:testCase[ts:testCaseBasic = 'true'])"/></numBasicTotal>
            <numBasicPass><xsl:value-of select="count(ts:specChapter/ts:testCase[ts:testCaseBasic = 'true'][ts:testCaseStatus = 'Passed'])"/></numBasicPass>
            <numBasicFail><xsl:value-of select="count(ts:specChapter/ts:testCase[ts:testCaseBasic = 'true'][ts:testCaseStatus = 'Failed'])"/></numBasicFail>
            <numBasicUnknown>not calculated</numBasicUnknown>
        </chapterCounts>
	</xsl:template>


</xsl:stylesheet>
