
var ccm_totalAdvancedSearchFields = 0;
var ccm_alLaunchType;
var ccm_alActiveAssetField = "";
var ccm_alProcessorTarget = "";
var ccm_alDebug = false;

ccm_triggerSelectFile = function(fID, af) {
	if (af == null) {
		var af = ccm_alActiveAssetField;
	}
	//alert(af);
	var obj = $('#' + af + "-fm-selected");
	var dobj = $('#' + af + "-fm-display");
	dobj.hide();
	obj.show();
	obj.load(CCM_TOOLS_PATH + '/files/selector_data?fID=' + fID + '&ccm_file_selected_field=' + af, function() {
		/*
		$(this).find('a.ccm-file-manager-clear-asset').click(function(e) {
			var field = $(this).attr('ccm-file-manager-field');
			ccm_clearFile(e, field);
		});
		*/
		obj.attr('fID', fID);
		obj.attr('ccm-file-manager-can-view', obj.children('div').attr('ccm-file-manager-can-view'));
		obj.attr('ccm-file-manager-can-edit', obj.children('div').attr('ccm-file-manager-can-edit'));
		obj.attr('ccm-file-manager-can-admin', obj.children('div').attr('ccm-file-manager-can-admin'));
		obj.attr('ccm-file-manager-can-replace', obj.children('div').attr('ccm-file-manager-can-replace'));
		
		obj.click(function(e) {
			e.stopPropagation();
			ccm_alActivateMenu($(this),e);
		});
	});
	var vobj = $('#' + af + "-fm-value");
	vobj.attr('value', fID);
	ccm_alSetupFileProcessor();
}
 
ccm_clearFile = function(e, af) {
	e.stopPropagation();
	var obj = $('#' + af + "-fm-selected");
	var dobj = $('#' + af + "-fm-display");
	var vobj = $('#' + af + "-fm-value");
	vobj.attr('value', 0);
	obj.hide();
	dobj.show();
}

ccm_activateFileManager = function(altype) {
	//delegate event handling to table container so clicks
	//to our star don't interfer with clicks to our rows
	ccm_alSetupSelectFiles();
	
	$(document).click(function(e) {		
		e.stopPropagation();
		ccm_alSelectNone();
	});
	
	if (altype == 'DASHBOARD') {
		$(".dialog-launch").dialog();
	}
	ccm_alLaunchType = altype;
	
	ccm_setupAdvancedSearch('file');
	ccm_alSetupCheckboxes();
	ccm_alSetupFileProcessor();
	ccm_alSetupSingleUploadForm();
	
	ccm_searchActivatePostFunction = function() {
		ccm_alSetupCheckboxes();
		ccm_alSetupSelectFiles();
	}
	// setup upload form
}

ccm_alSetupSingleUploadForm = function() {
	$(".ccm-file-manager-submit-single").submit(function() {  
		$(this).attr('target', ccm_alProcessorTarget);
		ccm_alSubmitSingle($(this).get(0));	 
	});
}

ccm_activateFileSelectors = function() {
	$(".ccm-file-manager-launch").unbind();
	$(".ccm-file-manager-launch").click(function() {
		ccm_alLaunchSelectorFileManager($(this).parent().attr('ccm-file-manager-field'));	
	});
}

ccm_alLaunchSelectorFileManager = function(selector) {
	ccm_alActiveAssetField = selector;
	var filterStr = "";
	
	var types = $('#' + selector + '-fm-display input.ccm-file-manager-filter');
	if (types.length) {
		for (i = 0; i < types.length; i++) {
			filterStr += '&' + $(types[i]).attr('name') + '=' + $(types[i]).attr('value');		
		}
	}
	
	ccm_launchFileManager(filterStr);
}

ccm_launchFileManager = function(filters) {
	$.fn.dialog.open({
		width: '90%',
		height: '70%',
		modal: false,
		href: CCM_TOOLS_PATH + "/files/search_dialog?search=1" + filters,
		title: ccmi18n_filemanager.title
	});
}

ccm_launchFileSetPicker = function(fsID) {
	$.fn.dialog.open({
		width: 500,
		height: 160,
		modal: false,
		href: CCM_TOOLS_PATH + '/files/pick_set?oldFSID=' + fsID,
		title: ccmi18n_filemanager.sets				
	});
}

ccm_alSubmitPickSetForm = function() {
	jQuery.fn.dialog.closeTop();
	var fsSel = $(".ccm-file-set-pick-cb #fsID")[0];
	var json = { "fsID" : fsSel.value,
	             "fsName" : fsSel.options[fsSel.options.selectedIndex].text };
	ccm_chooseAsset(json);
}

ccm_alSubmitSetsForm = function() {
	ccm_deactivateSearchResults();
	$("#ccm-file-add-to-set-form").ajaxSubmit(function(resp) {
		jQuery.fn.dialog.closeTop();
		$("#ccm-file-advanced-search").ajaxSubmit(function(resp) {
			ccm_parseAdvancedSearchResponse(resp);
		});
	});
}

ccm_alSubmitPasswordForm = function() {
	ccm_deactivateSearchResults();
	$("#ccm-file-password-form").ajaxSubmit(function(resp) {
		jQuery.fn.dialog.closeTop();
		$("#ccm-file-advanced-search").ajaxSubmit(function(resp) {
			ccm_parseAdvancedSearchResponse(resp);
		});
	});
}

ccm_alSubmitStorageForm = function() {
	ccm_deactivateSearchResults();
	$("#ccm-file-storage-form").ajaxSubmit(function(resp) {
		jQuery.fn.dialog.closeTop();
		$("#ccm-file-advanced-search").ajaxSubmit(function(resp) {
			ccm_parseAdvancedSearchResponse(resp);
		});
	});
}

ccm_alSubmitPermissionsForm = function() {
	ccm_deactivateSearchResults();
	$("#ccm-file-permissions-form").ajaxSubmit(function(resp) {
		jQuery.fn.dialog.closeTop();
		$("#ccm-file-advanced-search").ajaxSubmit(function(resp) {
			ccm_parseAdvancedSearchResponse(resp);
		});
	});
}

		
ccm_alSetupSetsForm = function() {
	// Setup the tri-state checkboxes
	$("div.ccm-file-set-add-cb a").each(function() {
		var cb = $(this);
		var startingState = cb.attr("ccm-tri-state-startup");
		$(this).click(function() {
			var selectedState = $(this).attr("ccm-tri-state-selected");
			var toSetState = 0;
			switch(selectedState) {
				case '0':
					if (startingState == '1') {
						toSetState = '1';
					} else {
						toSetState = '2';
					}
					break;
				case '1':
					toSetState = '2';
					break;
				case '2':
					toSetState = '0';
					break;
			}
			
			$(this).attr('ccm-tri-state-selected', toSetState);
			$(this).find('input').val(toSetState);
			$(this).find('img').attr('src', CCM_IMAGE_PATH + '/checkbox_state_' + toSetState + '.png');
		});
	});
	$("#ccm-file-add-to-set-form").submit(function() {
		ccm_alSubmitSetsForm();
		return false;
	});
}

ccm_alSetupPasswordForm = function() {
	$("#ccm-file-password-form").submit(function() {
		ccm_alSubmitPasswordForm();
		return false;
	});
}	
ccm_alRescanFiles = function() {
	var turl = CCM_TOOLS_PATH + '/files/rescan?';
	var files = arguments;
	for (i = 0; i < files.length; i++) {
		turl += 'fID[]=' + files[i] + '&';
	}
	$.fn.dialog.open({
		title: ccmi18n_filemanager.rescan,
		href: turl,
		width: 350,
		modal: false,
		height: 200,
		onClose: function() {
			if (files.length == 1) {
				$('#ccm-file-properties-wrapper').html('');
				jQuery.fn.dialog.showLoader();
				
				// open the properties window for this bad boy.
				$("#ccm-file-properties-wrapper").load(CCM_TOOLS_PATH + '/files/properties?fID=' + files[0] + '&reload=1', false, function() {
					jQuery.fn.dialog.hideLoader();
					$(this).find(".dialog-launch").dialog();

				});				
			}
		}
	});
}

	
ccm_alSelectPermissionsEntity = function(selector, id, name) {
	var html = $('#ccm-file-permissions-entity-base').html();
	$('#ccm-file-permissions-entities-wrapper').append('<div class="ccm-file-permissions-entity">' + html + '<\/div>');
	var p = $('.ccm-file-permissions-entity');
	var ap = p[p.length - 1];
	$(ap).find('h2 span').html(name);
	$(ap).find('input[type=hidden]').val(selector + '_' + id);
	$(ap).find('input[type=radio]').each(function() {
		$(this).attr('name', $(this).attr('name') + '_' + selector + '_' + id);
	});
	$(ap).find('div.ccm-file-access-extensions input[type=checkbox]').each(function() {
		$(this).attr('name', $(this).attr('name') + '_' + selector + '_' + id + '[]');
	});
	
	ccm_alActivateFilePermissionsSelector();	
}

ccm_alActivateFilePermissionsSelector = function() {
	$("tr.ccm-file-access-add input").unbind();
	$("tr.ccm-file-access-add input").click(function() {
		var p = $(this).parents('div.ccm-file-permissions-entity')[0];
		if ($(this).val() == ccmi18n_filemanager.PTYPE_CUSTOM) {
			$(p).find('div.ccm-file-access-add-extensions').show();				
		} else {
			$(p).find('div.ccm-file-access-add-extensions').hide();				
		}
	});
	$("tr.ccm-file-access-file-manager input").click(function() {
		var p = $(this).parents('div.ccm-file-permissions-entity')[0];
		if ($(this).val() != ccmi18n_filemanager.PTYPE_NONE) {
			$(p).find('tr.ccm-file-access-add').show();				
			$(p).find('tr.ccm-file-access-edit').show();				
			$(p).find('tr.ccm-file-access-admin').show();
			//$(p).find('div.ccm-file-access-add-extensions').show();				
		} else {
			$(p).find('tr.ccm-file-access-add').hide();				
			$(p).find('tr.ccm-file-access-edit').hide();				
			$(p).find('tr.ccm-file-access-admin').hide();				
			$(p).find('div.ccm-file-access-add-extensions').hide();				
		}
	});


	$("a.ccm-file-permissions-remove").click(function() {
		$(this).parent().parent().fadeOut(100, function() {
			$(this).remove();
		});
	});
	$("input[name=toggleCanAddExtension]").unbind();
	$("input[name=toggleCanAddExtension]").click(function() {
		var ext = $(this).parent().parent().find('div.ccm-file-access-extensions');
		
		if ($(this).attr('checked') == 1) {
			ext.find('input').attr('checked', true);
		} else {
			ext.find('input').attr('checked', false);
		}
	});
}

ccm_alSetupVersionSelector = function() {
	$("#ccm-file-versions-grid input[type=radio]").click(function() {
		$('#ccm-file-versions-grid tr').removeClass('ccm-file-versions-grid-active');
		
		var trow = $(this).parent().parent();
		var fID = trow.attr('fID');
		var fvID = trow.attr('fvID');
		var postStr = 'task=approve_version&fID=' + fID + '&fvID=' + fvID;
		$.post(CCM_TOOLS_PATH + '/files/properties', postStr, function(resp) {
			console.log(resp);
			trow.addClass('ccm-file-versions-grid-active');
			trow.find('td').show('highlight', {
				color: '#FFF9BB'
			});
		});
	});
	
	$(".ccm-file-versions-remove").click(function() {
		var trow = $(this).parent().parent();
		var fID = trow.attr('fID');
		var fvID = trow.attr('fvID');
		var postStr = 'task=delete_version&fID=' + fID + '&fvID=' + fvID;
		$.post(CCM_TOOLS_PATH + '/files/properties', postStr, function(resp) {
			trow.fadeOut(200, function() {
				trow.remove();
			});
		});
		return false;
	});
}

ccm_alDeleteFiles = function() {
	$("#ccm-delete-files-form").ajaxSubmit(function(resp) {
		ccm_parseJSON(resp, function() {	
			jQuery.fn.dialog.closeTop();
			ccm_deactivateSearchResults();
			$("#ccm-file-advanced-search").ajaxSubmit(function(resp) {
				ccm_parseAdvancedSearchResponse(resp);
			});
		});
	});
}

ccm_alSetupSelectFiles = function() {
	$('#ccm-file-list').click(function(e){
		e.stopPropagation();
		if ($(e.target).is('img.ccm-star')) {	
			var fID = $(e.target).parents('tr.ccm-list-record')[0].id;
			fID = fID.substring(3);
			ccm_starFile(e.target,fID);
		}
		else{
			$(e.target).parents('tr.ccm-list-record').each(function(){
				ccm_alActivateMenu($(this), e);		
			});
		}
	});
	$("div.ccm-file-list-thumbnail-image img").hover(function(e) { 
		var fID = $(this).parent().attr('fID');
		var obj = $('#fID' + fID + 'hoverThumbnail'); 
		if (obj.length > 0) { 
			var tdiv = obj.find('div');
			var pos = obj.position();
			tdiv.css('top', pos.top);
			tdiv.css('left', pos.left);
			tdiv.show();
		}
	}, function() {
		var fID = $(this).parent().attr('fID');
		var obj = $('#fID' + fID + 'hoverThumbnail');
		var tdiv = obj.find('div');
		tdiv.hide(); 
	});
}

ccm_alSetupCheckboxes = function() {
	$("#ccm-file-list-cb-all").click(function() {
		if ($(this).attr('checked') == true) {
			$('.ccm-list-record td.ccm-file-list-cb input[type=checkbox]').attr('checked', true);
			$("#ccm-file-list-multiple-operations").attr('disabled', false);
		} else {
			$('.ccm-list-record td.ccm-file-list-cb input[type=checkbox]').attr('checked', false);
			$("#ccm-file-list-multiple-operations").attr('disabled', true);
		}
	});
	$(".ccm-list-record td.ccm-file-list-cb input[type=checkbox]").click(function(e) {
		e.stopPropagation();
		ccm_alRescanMultiFileMenu();
	});
	$(".ccm-list-record td.ccm-file-list-cb").click(function(e) {
		e.stopPropagation();
		$(this).find('input[type=checkbox]').click();
		ccm_alRescanMultiFileMenu();
	});
	
	// if we're not in the dashboard, add to the multiple operations select menu
	if (ccm_alLaunchType != 'DASHBOARD') {
		var chooseText = ccmi18n_filemanager.select;
		$("#ccm-file-list-multiple-operations option:eq(0)").after("<option value=\"choose\">" + chooseText + "</option>");
	}
	$("#ccm-file-list-multiple-operations").change(function() {
		var action = $(this).val();
		var fIDstring = ccm_alGetSelectedFileIDs();
		switch(action) {
			case 'choose':
				var fIDs = new Array();
				$(".ccm-list-record td.ccm-file-list-cb input[type=checkbox]:checked").each(function() {
					fIDs.push($(this).val());
				});
				ccm_alSelectFile(fIDs, true);
				break;
			case "delete":
				jQuery.fn.dialog.open({
					width: 500,
					height: 400,
					modal: false,
					href: CCM_TOOLS_PATH + '/files/delete?' + fIDstring,
					title: ccmi18n_filemanager.deleteFile				
				});
				break;
			case "sets":
				jQuery.fn.dialog.open({
					width: 500,
					height: 400,
					modal: false,
					href: CCM_TOOLS_PATH + '/files/add_to?' + fIDstring,
					title: ccmi18n_filemanager.sets				
				});
				break;
			case "properties": 
				jQuery.fn.dialog.open({
					width: 630,
					height: 450,
					modal: false,
					href: CCM_TOOLS_PATH + '/files/bulk_properties?' + fIDstring,
					title: ccmi18n.properties				
				});
				break;				
			case "rescan":
				jQuery.fn.dialog.open({
					width: 350,
					height: 200,
					modal: false,
					href: CCM_TOOLS_PATH + '/files/rescan?' + fIDstring,
					title: ccmi18n_filemanager.rescan				
				});
				break;
			case "download":
				window.frames[ccm_alProcessorTarget].location = CCM_TOOLS_PATH + '/files/download?' + fIDstring;
				break;
		}
		
		$(this).get(0).selectedIndex = 0;
	});

	// activate the file sets checkboxes
	$("div.ccm-file-search-advanced-sets-cb input[type=checkbox]").unbind();
	$("div.ccm-file-search-advanced-sets-cb input[type=checkbox]").click(function() {
		$("input[name=fsIDNone]").attr('checked', false);
		$("#ccm-file-advanced-search").submit();
	});
	
	$("input[name=fsIDNone]").unbind();
	$("input[name=fsIDNone]").click(function() {
		if ($(this).attr('checked')) {
			$("div.ccm-file-search-advanced-sets-cb input[type=checkbox]").attr('checked', false);
			$("div.ccm-file-search-advanced-sets-cb input[type=checkbox]").attr('disabled', true);
		} else {
			$("div.ccm-file-search-advanced-sets-cb input[type=checkbox]").attr('disabled', false);
		}
		$("#ccm-file-advanced-search").submit();
	});

}

ccm_alGetSelectedFileIDs = function() {
	var fidstr = '';
	$(".ccm-list-record td.ccm-file-list-cb input[type=checkbox]:checked").each(function() {
		fidstr += 'fID[]=' + $(this).val() + '&';
	});
	return fidstr;
}

ccm_alRescanMultiFileMenu = function() {
	if ($(".ccm-list-record td.ccm-file-list-cb input[type=checkbox]:checked").length > 0) {
		$("#ccm-file-list-multiple-operations").attr('disabled', false);
	} else {
		$("#ccm-file-list-multiple-operations").attr('disabled', true);
	}
}

ccm_alSetupFileProcessor = function() {
	if (ccm_alProcessorTarget != '') {
		return false;
	}
	
	var ts = parseInt(new Date().getTime().toString().substring(0, 10)); 
	var ifr; 
	try { //IE7 hack
	  ifr = document.createElement('<iframe name="ccm-al-upload-processor'+ts+'">');
	} catch (ex) {
	  ifr = document.createElement('iframe');
	}	
	ifr.id = 'ccm-al-upload-processor' + ts;
	ifr.name = 'ccm-al-upload-processor' + ts;
	ifr.style.border='0px';
	ifr.style.width='0px';
	ifr.style.height='0px';
	ifr.style.display = "none";
	document.body.appendChild(ifr);
	
	if (ccm_alDebug) {
		ccm_alProcessorTarget = "_blank";
	} else {
		ccm_alProcessorTarget = 'ccm-al-upload-processor' + ts;
	}
}

ccm_alSubmitSingle = function(form) {
	if ($(form).find(".ccm-al-upload-single-file").val() == '') { 
		alert(ccmi18n_filemanager.uploadErrorChooseFile);
		return false;
	} else { 
		$(form).find('.ccm-al-upload-single-submit').hide();
		$(form).find('.ccm-al-upload-single-loader').show();
	}
}

ccm_alResetSingle = function () {
	$('.ccm-al-upload-single-file').val('');
	$('.ccm-al-upload-single-loader').hide();
	$('.ccm-al-upload-single-submit').show();
}

var ccm_uploadedFiles=[];
ccm_filesUploadedDialog = function(){ 
	if(document.getElementById('ccm-file-upload-multiple-tab')) 
		jQuery.fn.dialog.closeTop()
	var fIDstring='';
	for( var i=0; i< ccm_uploadedFiles.length; i++ )
		fIDstring=fIDstring+'&fID[]='+ccm_uploadedFiles[i];
	jQuery.fn.dialog.open({
		width: 350,
		height: 120,
		modal: false,
		href: CCM_TOOLS_PATH + '/files/add_to_complete/?'+fIDstring,
		title: ccmi18n_filemanager.uploadComplete				
	});
	ccm_uploadedFiles=[];
}
ccm_filesApplySetsToUploaded = function(fIDs){
	var fIDstring='';
	for( var i=0; i< fIDs.length; i++ )
		fIDstring=fIDstring+'&fID[]='+fIDs[i];	
	jQuery.fn.dialog.open({
		width: 500,
		height: 400,
		modal: false,
		href: CCM_TOOLS_PATH + '/files/add_to?' + fIDstring,
		title: ccmi18n_filemanager.sets				
	});
}
ccm_filesApplyPropertiesToUploaded = function(fIDs){
	var fIDstring='',url='/files/bulk_properties?',popupW=630,popupH=450; 
	if(fIDs.length==1){
		fIDstring='&fID='+fIDs[0];
		url='/files/properties?';
		popupW=500
		popupH=400; 
	}else{	
		for( var i=0; i< fIDs.length; i++ )
			fIDstring=fIDstring+'&fID[]='+fIDs[i];		
	}
	jQuery.fn.dialog.open({
		width: popupW,
		height: popupH,
		modal: false,
		href: CCM_TOOLS_PATH + url + fIDstring,
		title: ccmi18n_filemanager.properties				
	});
}

ccm_alRefresh = function(highlightFIDs, fileSelector) {
	var ids = highlightFIDs;
	ccm_deactivateSearchResults();
	$("#ccm-search-results").load(CCM_TOOLS_PATH + '/files/search_results', {
		'ccm_order_by': 'fvDateAdded',
		'ccm_order_dir': 'desc', 
		'fileSelector': fileSelector
	}, function() {
		ccm_activateSearchResults();
		ccm_alResetSingle();
		if (ids != false) {
			ccm_alHighlightFileIDArray(ids);
		}
		ccm_alSetupSelectFiles();

	});
}

ccm_alHighlightFileIDArray = function(ids) {
	for (i = 0; i < ids.length; i++) {
		var oldBG = $("#fID" + ids[i] + ' td').css('backgroundColor');
		$("#fID" + ids[i] + ' td').animate({ backgroundColor: '#FFF9BB'}, { queue: true, duration: 300 }).animate( {backgroundColor: oldBG}, 500);
	}
}

ccm_alSelectFile = function(fID) {
	
	if (typeof(ccm_chooseAsset) == 'function') {
		var qstring = '';
		if (typeof(fID) == 'object') {
			for (i = 0; i < fID.length; i++) {
				qstring += 'fID[]=' + fID[i] + '&';
			}
		} else {
			qstring += 'fID=' + fID;
		}
		
		ccm_deactivateSearchResults();

		$.getJSON(CCM_TOOLS_PATH + '/files/get_data.php?' + qstring, function(resp) {
			ccm_parseJSON(resp, function() {
				for(i = 0; i < resp.length; i++) {
					ccm_chooseAsset(resp[i]);
				}
				jQuery.fn.dialog.closeTop();
			});
		});
		
	} else {
		if (typeof(fID) == 'object') {
			for (i = 0; i < fID.length; i++) {
				ccm_triggerSelectFile(fID[i]);
			}
		} else {
			ccm_triggerSelectFile(fID);
		}
		jQuery.fn.dialog.closeTop();	
	}

}

ccm_alActivateMenu = function(obj, e) {
	
	// Is this a file that's already been chosen that we're selecting?
	// If so, we need to offer the reset switch
	
	var selectedFile = $(obj).find('div[ccm-file-manager-field]');
	var selector = '';
	if(selectedFile.length > 0) {
		selector = selectedFile.attr('ccm-file-manager-field');
	}
	ccm_hideMenus();
	
	var fID = $(obj).attr('fID');

	// now, check to see if this menu has been made
	var bobj = document.getElementById("ccm-al-menu" + fID + selector);
	
	// This immediate click mode has promise, but it's annoying more than it's helpful
	/*
	if (ccm_alLaunchType != 'DASHBOARD' && selector == '') {
		// then we are in file list mode in the site, which means we 
		// we don't give out all the options in the list
		ccm_alSelectFile(fID);
		return;
	}
	*/
	
	if (!bobj) {
		// create the 1st instance of the menu
		el = document.createElement("DIV");
		el.id = "ccm-al-menu" + fID + selector;
		el.className = "ccm-menu";
		el.style.display = "none";
		document.body.appendChild(el);
		
		var filepath = $(obj).attr('al-filepath'); 
		bobj = $("#ccm-al-menu" + fID + selector);
		bobj.css("position", "absolute");
		
		//contents  of menu
		var html = '<div class="ccm-menu-tl"><div class="ccm-menu-tr"><div class="ccm-menu-t"></div></div></div>';
		html += '<div class="ccm-menu-l"><div class="ccm-menu-r">';
		html += '<ul>';
		if (ccm_alLaunchType != 'DASHBOARD') {
			// if we're launching this at the selector level, that means we've already chosen a file, and this should instead launch the library
			var onclick = (selectedFile.length > 0) ? 'ccm_alLaunchSelectorFileManager(\'' + selector + '\')' : 'ccm_alSelectFile(' + fID + ')';
			var chooseText = (selectedFile.length > 0) ? ccmi18n_filemanager.chooseNew : ccmi18n_filemanager.select;
			html += '<li><a class="ccm-icon" dialog-modal="false" dialog-width="90%" dialog-height="70%" dialog-title="' + ccmi18n_filemanager.select + '" id="menuSelectFile' + fID + '" href="javascript:void(0)" onclick="' + onclick + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/add.png)">'+ chooseText + '<\/span><\/a><\/li>';
		}
		if (selectedFile.length > 0) {
			html += '<li><a class="ccm-icon" href="javascript:void(0)" id="menuClearFile' + fID + selector + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/remove.png)">'+ ccmi18n_filemanager.clear + '<\/span><\/a><\/li>';
		}
		
		if (ccm_alLaunchType != 'DASHBOARD' && selectedFile.length > 0) {
			html += '<li class="header"></li>';	
		}
		if ($(obj).attr('ccm-file-manager-can-view') == '1') {
			html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="90%" dialog-height="75%" dialog-title="' + ccmi18n_filemanager.view + '" id="menuView' + fID + '" href="' + CCM_TOOLS_PATH + '/files/view?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/design_small.png)">'+ ccmi18n_filemanager.view + '<\/span><\/a><\/li>';
		} else {
			html += '<li><a class="ccm-icon" id="menuDownload' + fID + '" target="' + ccm_alProcessorTarget + '" href="' + CCM_TOOLS_PATH + '/files/download?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/design_small.png)">'+ ccmi18n_filemanager.download + '<\/span><\/a><\/li>';	
		}
		if ($(obj).attr('ccm-file-manager-can-edit') == '1') {
			html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="90%" dialog-height="75%" dialog-title="' + ccmi18n_filemanager.edit + '" id="menuEdit' + fID + '" href="' + CCM_TOOLS_PATH + '/files/edit?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/edit_small.png)">'+ ccmi18n_filemanager.edit + '<\/span><\/a><\/li>';
		}
		html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="630" dialog-height="450" dialog-title="' + ccmi18n_filemanager.properties + '" id="menuProperties' + fID + '" href="' + CCM_TOOLS_PATH + '/files/properties?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/wrench.png)">'+ ccmi18n_filemanager.properties + '<\/span><\/a><\/li>';
		if ($(obj).attr('ccm-file-manager-can-replace') == '1') {
			html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="300" dialog-height="250" dialog-title="' + ccmi18n_filemanager.replace + '" id="menuFileReplace' + fID + '" href="' + CCM_TOOLS_PATH + '/files/replace?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/paste_small.png)">'+ ccmi18n_filemanager.replace + '<\/span><\/a><\/li>';
		}
		html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="500" dialog-height="400" dialog-title="' + ccmi18n_filemanager.sets + '" id="menuFileSets' + fID + '" href="' + CCM_TOOLS_PATH + '/files/add_to?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/window_new.png)">'+ ccmi18n_filemanager.sets + '<\/span><\/a><\/li>';
		if ($(obj).attr('ccm-file-manager-can-admin') == '1' || $(obj).attr('ccm-file-manager-can-delete') == '1') {
			html += '<li class="header"></li>';
		}
		if ($(obj).attr('ccm-file-manager-can-admin') == '1') {
			html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="400" dialog-height="380" dialog-title="' + ccmi18n_filemanager.permissions + '" id="menuFilePermissions' + fID + '" href="' + CCM_TOOLS_PATH + '/files/permissions?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/permissions_small.png)">'+ ccmi18n_filemanager.permissions + '<\/span><\/a><\/li>';
		}
		if ($(obj).attr('ccm-file-manager-can-delete') == '1') {
			html += '<li><a class="ccm-icon dialog-launch" dialog-modal="false" dialog-width="500" dialog-height="400" dialog-title="' + ccmi18n_filemanager.deleteFile + '" id="menuDeleteFile' + fID + '" href="' + CCM_TOOLS_PATH + '/files/delete?fID=' + fID + '"><span style="background-image: url(' + CCM_IMAGE_PATH + '/icons/delete_small.png)">'+ ccmi18n_filemanager.deleteFile + '<\/span><\/a><\/li>';
		}
		html += '</ul>';
		html += '</div></div>';
		html += '<div class="ccm-menu-bl"><div class="ccm-menu-br"><div class="ccm-menu-b"></div></div></div>';
		bobj.append(html);
		
		$("#ccm-al-menu" + fID + selector + " a.dialog-launch").dialog();
		
		$('a#menuClearFile' + fID + selector).click(function(e) {
			ccm_clearFile(e, selector);
			ccm_hideMenus();
		});

	} else {
		bobj = $("#ccm-al-menu" + fID + selector);
	}
	
	ccm_fadeInMenu(bobj, e);

}

ccm_alSelectNone = function() {
	ccm_hideMenus();
}

var checkbox_status = false;
toggleCheckboxStatus = function(form) {
	if(checkbox_status) {
		for (i = 0; i < form.elements.length; i++) {
			if (form.elements[i].type == "checkbox") {
				form.elements[i].checked = false;
			}
		}	
		checkbox_status = false;
	}
	else {
		for (i = 0; i < form.elements.length; i++) {
			if (form.elements[i].type == "checkbox") {
				form.elements[i].checked = true;
			}
		}	
		checkbox_status = true;	
	}
}	

ccm_alSelectMultipleIncomingFiles = function(obj) {
	if ($(obj).attr('checked')) {
		$("input.ccm-file-select-incoming").attr('checked', true);
	} else {
		$("input.ccm-file-select-incoming").attr('checked', false);
	}
}

ccm_starFile = function (img,fID) {				
	var action = '';
	if ($(img).attr('src').indexOf(CCM_STAR_STATES.unstarred) != -1) {
		$(img).attr('src',$(img).attr('src').replace(CCM_STAR_STATES.unstarred,CCM_STAR_STATES.starred));
		action = 'star';
	}
	else {
		$(img).attr('src',$(img).attr('src').replace(CCM_STAR_STATES.starred,CCM_STAR_STATES.unstarred));
		action = 'unstar';
	}
	
	$.post(CCM_TOOLS_PATH + '/' + CCM_STAR_ACTION,{'action':action,'file-id':fID},function(data, textStatus){
		//callback, in case we want to do some post processing
	});
}
