<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
	version='1.0'
	xmlns:xsl='http://www.w3.org/1999/XSL/Transform'
>
	<!--
		
		Transformation to a test suite chapter results XML files into an XML file
		containing summary statistics for that chapter.
		
	-->
	
	<!-- 
		Gives a subdirectory name. Defined in build.xml.
	-->
    <xsl:param name="dir"></xsl:param>

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
	<xsl:template match="/results">

        <xsl:variable name="ch02" select="document(concat($dir, '/XF11_02_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch03" select="document(concat($dir, '/XF11_03_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch04" select="document(concat($dir, '/XF11_04_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch05" select="document(concat($dir, '/XF11_05_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch06" select="document(concat($dir, '/XF11_06_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch07" select="document(concat($dir, '/XF11_07_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch08" select="document(concat($dir, '/XF11_08_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch09" select="document(concat($dir, '/XF11_09_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch10" select="document(concat($dir, '/XF11_10_Results.counts'))/chapterCounts"/>
        <xsl:variable name="ch11" select="document(concat($dir, '/XF11_11_Results.counts'))/chapterCounts"/>
        <xsl:variable name="AppB" select="document(concat($dir, '/XF11_AppendixB_Results.counts'))/chapterCounts"/>

        <xsl:variable name="numNormTotal" 
                      select="$ch02/numNormTotal +
                              $ch03/numNormTotal +
                              $ch04/numNormTotal +
                              $ch05/numNormTotal +
                              $ch06/numNormTotal +
                              $ch07/numNormTotal +
                              $ch08/numNormTotal +
                              $ch09/numNormTotal +
                              $ch10/numNormTotal +
                              $ch11/numNormTotal +
                              $AppB/numNormTotal"/>
                                                                    
        <xsl:variable name="numNormPass" 
                      select="$ch02/numNormPass+
                              $ch03/numNormPass+
                              $ch04/numNormPass+
                              $ch05/numNormPass+
                              $ch06/numNormPass+
                              $ch07/numNormPass+
                              $ch08/numNormPass+
                              $ch09/numNormPass+
                              $ch10/numNormPass+
                              $ch11/numNormPass+
                              $AppB/numNormPass"/>
                                                                        
        <xsl:variable name="numNormFail" 
                      select="$ch02/numNormFail+
                              $ch03/numNormFail+
                              $ch04/numNormFail+
                              $ch05/numNormFail+
                              $ch06/numNormFail+
                              $ch07/numNormFail+
                              $ch08/numNormFail+
                              $ch09/numNormFail+
                              $ch10/numNormFail+
                              $ch11/numNormFail+
                              $AppB/numNormFail"/> 
                              
         <xsl:variable name="numBasicTotal" 
                      select="$ch02/numBasicTotal+
                              $ch03/numBasicTotal+
                              $ch04/numBasicTotal+
                              $ch05/numBasicTotal+
                              $ch06/numBasicTotal+
                              $ch07/numBasicTotal+
                              $ch08/numBasicTotal+
                              $ch09/numBasicTotal+
                              $ch10/numBasicTotal+
                              $ch11/numBasicTotal+
                              $AppB/numBasicTotal"/>
                                                                       
        <xsl:variable name="numBasicPass" 
                      select="$ch02/numBasicPass+
                              $ch03/numBasicPass+
                              $ch04/numBasicPass+
                              $ch05/numBasicPass+
                              $ch06/numBasicPass+
                              $ch07/numBasicPass+
                              $ch08/numBasicPass+
                              $ch09/numBasicPass+
                              $ch10/numBasicPass+
                              $ch11/numBasicPass+
                              $AppB/numBasicPass"/>
                                                                        
        <xsl:variable name="numBasicFail" 
                      select="$ch02/numBasicFail+
                              $ch03/numBasicFail+
                              $ch04/numBasicFail+
                              $ch05/numBasicFail+
                              $ch06/numBasicFail+
                              $ch07/numBasicFail+
                              $ch08/numBasicFail+
                              $ch09/numBasicFail+
                              $ch10/numBasicFail+
                              $ch11/numBasicFail+
                              $AppB/numBasicFail"/>  


        <results xmlns="">
            <numNormTotal><xsl:value-of select="$numNormTotal"/></numNormTotal>
            <numNormPass><xsl:value-of select="$numNormPass"/></numNormPass>
            <numNormFail><xsl:value-of select="$numNormFail"/></numNormFail>
            <numNormUnknown>not calculated</numNormUnknown>
            <numBasicTotal><xsl:value-of select="$numBasicTotal"/></numBasicTotal>
            <numBasicPass><xsl:value-of select="$numBasicPass"/></numBasicPass>
            <numBasicFail><xsl:value-of select="$numBasicFail"/></numBasicFail>
            <numBasicUnknown>not calculated</numBasicUnknown>
        </results>
	</xsl:template>


</xsl:stylesheet>
