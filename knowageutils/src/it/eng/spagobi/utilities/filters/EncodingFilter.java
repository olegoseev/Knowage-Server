/*
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 * 
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Knowage is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.eng.spagobi.utilities.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.log4j.Logger;

public class EncodingFilter implements Filter {

	
	private static transient Logger logger = Logger.getLogger(EncodingFilter.class);
	 private FilterConfig filterConfig = null;
	 
	 public void init(FilterConfig filterConfig) {
		    this.filterConfig = filterConfig;
		  }
	 
	
    public void destroy() {
    	// do nothing
    }
    
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
        	throws IOException, ServletException {
        	logger.debug("IN");
        	
        	String encoding = filterConfig.getInitParameter("encoding");
        	if(encoding == null) encoding = "UTF-8";        	
        	request.setCharacterEncoding(encoding);
    		
        	chain.doFilter(request, response);
    }

}
