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
package it.eng.spagobi.services.common;

import it.eng.spago.base.SourceBean;
import it.eng.spago.base.SourceBeanException;
import it.eng.spagobi.commons.utilities.SpagoBIUtilities;

import java.io.InputStream;

import org.apache.log4j.Logger;
import org.xml.sax.InputSource;

/**
 * Class that read engine-config.xml file
 */
public class EnginConf {
	private SourceBean config = null;

	private String resourcePath = null;
	private String spagoBiServerUrl = null;
	private String spagoBiSsoClass = null;
	private String sessionExpiredUrl = null;

	/**
	 * For testing purpose
	 */
	private static InputStream testconfigInputstream;

	private static transient Logger logger = Logger.getLogger(EnginConf.class);

	private static EnginConf instance = null;

	/**
	 * Gets the instance.
	 *
	 * @return EnginConf
	 */
	public static EnginConf getInstance() {
		if (instance == null)
			instance = new EnginConf();
		return instance;
	}

	public static EnginConf getInstanceCheckingMissingClass(boolean checkMissingClass) {
		logger.debug("IN");
		if (instance == null)
			logger.debug("Create an engine config with the possibility to check missing class");
		instance = new EnginConf(checkMissingClass);
		logger.debug("OUT");
		return instance;
	}

	private EnginConf() {
		createEngineConfig(false);
	}

	private EnginConf(boolean checkMissingClass) {
		createEngineConfig(checkMissingClass);
	}

	/**
	 * Gets the config.
	 *
	 * @return SourceBean contain the configuration
	 */
	public SourceBean getConfig() {
		return config;
	}

	/**
	 * Gets the pass.
	 *
	 * @return the pass
	 */
	public String getPass() {
		SourceBean passSB = (SourceBean) config.getAttribute("PASS");
		String pass = passSB.getCharacters();
		return pass;
	}

	/**
	 * @return the resourcePath
	 */
	private void setResourcePath() {
		logger.debug("IN");
		SourceBean sb = (SourceBean) config.getAttribute("RESOURCE_PATH_JNDI_NAME");
		String path = sb.getCharacters();
		resourcePath = SpagoBIUtilities.readJndiResource(path);
		logger.debug("OUT");
	}

	public String getSessionExpiredUrl() {
		return sessionExpiredUrl;
	}

	private void setSessionExpiredUrl() {
		logger.debug("IN");
		SourceBean sb = (SourceBean) config.getAttribute("SESSION_EXPIRED_URL");
		if (sb != null) {
			sessionExpiredUrl = sb.getCharacters();
		} else {
			sessionExpiredUrl = null;
		}
		logger.debug("OUT");
	}

	public String getResourcePath() {
		return resourcePath;
	}

	public String getSpagoBiServerUrl() {
		return spagoBiServerUrl;
	}

	private void setSpagoBiServerUrl() {
		logger.debug("IN");
		SourceBean sb = (SourceBean) config.getAttribute("SPAGOBI_SERVER_URL");
		String server = sb.getCharacters();
		if (server != null && server.length() > 0) {
			spagoBiServerUrl = server;
		} else {
			sb = (SourceBean) config.getAttribute("SPAGOBI_SERVER_URL_JNDI_NAME");
			server = sb.getCharacters();
			spagoBiServerUrl = SpagoBIUtilities.readJndiResource(server);
		}

		logger.debug("OUT");

	}

	/*
	 * public String getSpagoBiDomain() { return spagoBiDomain; }
	 */

	/*
	 * private void setSpagoBiDomain() { logger.debug("IN"); SourceBean sb = (SourceBean) config.getAttribute("SPAGOBI_DOMAIN_JNDI_NAME"); String domain =
	 * (String) sb.getCharacters(); if (domain!=null && domain.length()>0){ spagoBiDomain = SpagoBIUtilities.readJndiResource(domain); } logger.debug("OUT"); }
	 */

	public String getSpagoBiSsoClass() {
		return spagoBiSsoClass;
	}

	private void setSpagoBiSsoClass() {
		logger.debug("IN");
		SourceBean sb = (SourceBean) config.getAttribute("INTEGRATION_CLASS_JNDI");
		String classSso = sb.getCharacters();
		if (classSso != null && classSso.length() > 0) {
			spagoBiSsoClass = SpagoBIUtilities.readJndiResource(classSso);
		}

		logger.debug("OUT");
	}

	public class MissingClassException extends RuntimeException {

		private static final long serialVersionUID = 2774873565477585510L;

		public MissingClassException(String msg) {
			super(msg);
		}

		public MissingClassException(String msg, Throwable t) {
			super(msg, t);
		}
	}

	private void createEngineConfig(boolean checkMissingClass) {
		logger.debug("IN");
		try {
			logger.debug("Resource: " + getClass().getResource("/engine-config.xml"));
			if (getClass().getResource("/engine-config.xml") != null || testconfigInputstream != null) {
				InputSource source;
				if (testconfigInputstream != null) {
					source = new InputSource(testconfigInputstream);
				} else {
					InputStream configInputStream = getClass().getResourceAsStream("/engine-config.xml");
					source = new InputSource(configInputStream);
				}
				config = SourceBean.fromXMLStream(source);

				setResourcePath();
				setSpagoBiServerUrl();
				setSpagoBiSsoClass();
				setSessionExpiredUrl();
			} else {

				logger.debug("Impossible to load configuration for report engine. Checking if throw a missing class exception...");
				if (checkMissingClass) {
					logger.debug("It's needed to throw a missing class exception");
					throw new MissingClassException("Impossible to load configuration for report engine");
				}

			}
			logger.debug("OUT");
		} catch (SourceBeanException e) {
			logger.error("Impossible to load configuration for report engine", e);
		}
	}

	public static InputStream getTestconfigInputstream() {
		return testconfigInputstream;
	}

	public static void setTestconfigInputstream(InputStream testconfigInputstream) {
		EnginConf.testconfigInputstream = testconfigInputstream;
	}

}
