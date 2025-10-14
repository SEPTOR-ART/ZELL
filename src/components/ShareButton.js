import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Button,
  IconButton,
  Menu,
  Text,
  Surface,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ShareService from '../services/ShareService';

/**
 * ShareButton Component
 * Reusable component for sharing files across the app
 */
const ShareButton = ({ 
  file, 
  files, 
  mode = 'button', // 'button', 'icon', 'menu'
  size = 'medium',
  style,
  onShareSuccess,
  onShareError,
  showOptions = false,
  customMessage = '',
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [sharingOptions, setSharingOptions] = useState([]);

  /**
   * Initialize sharing options
   */
  React.useEffect(() => {
    const loadSharingOptions = async () => {
      const options = ShareService.getAvailableSharingOptions();
      setSharingOptions(options);
    };
    loadSharingOptions();
  }, []);

  /**
   * Handle file sharing
   */
  const handleShare = useCallback(async (shareMethod = null) => {
    try {
      setIsSharing(true);
      setMenuVisible(false);

      const filesToShare = files || (file ? [file] : []);
      
      if (filesToShare.length === 0) {
        throw new Error('No files to share');
      }

      let result;
      if (filesToShare.length === 1) {
        // Share single file
        const shareOptions = {
          dialogTitle: `Share ${filesToShare[0].name}`,
        };

        if (customMessage) {
          result = await ShareService.shareFileWithMessage(
            filesToShare[0], 
            customMessage, 
            shareOptions
          );
        } else {
          result = await ShareService.shareFile(filesToShare[0], shareOptions);
        }
      } else {
        // Share multiple files
        const shareOptions = {
          dialogTitle: `Share ${filesToShare.length} files`,
          title: `Shared ${filesToShare.length} files from ZELL`,
          text: customMessage || `Sharing ${filesToShare.length} files`,
        };

        result = await ShareService.shareMultipleFiles(filesToShare, shareOptions);
      }

      if (result) {
        // Log sharing activity
        await ShareService.logSharingActivity({
          fileName: filesToShare[0]?.name || 'Multiple files',
          fileSize: filesToShare.reduce((total, f) => total + (f.size || 0), 0),
          method: shareMethod || 'native',
          success: true,
        });

        // Show success message
        ShareService.showShareSuccessToast(
          filesToShare.length === 1 ? filesToShare[0].name : `${filesToShare.length} files`,
          shareMethod
        );

        // Call success callback
        onShareSuccess?.(filesToShare, shareMethod);
      }

    } catch (error) {
      console.error('Share error:', error);
      
      // Log failed sharing activity
      await ShareService.logSharingActivity({
        fileName: files?.length > 0 ? files[0].name : file?.name || 'Unknown',
        fileSize: files?.reduce((total, f) => total + (f.size || 0), 0) || file?.size || 0,
        method: shareMethod || 'native',
        success: false,
      });

      // Show error message
      ShareService.showShareErrorToast(error.message);
      
      // Call error callback
      onShareError?.(error);
    } finally {
      setIsSharing(false);
    }
  }, [file, files, customMessage, onShareSuccess, onShareError]);

  /**
   * Handle quick share to specific app
   */
  const handleQuickShare = useCallback(async (appId) => {
    try {
      setIsSharing(true);
      
      const filesToShare = files || (file ? [file] : []);
      const shareOptions = {
        dialogTitle: `Share via ${appId}`,
        // Add app-specific options if needed
      };

      let result;
      if (filesToShare.length === 1) {
        result = await ShareService.shareFile(filesToShare[0], shareOptions);
      } else {
        result = await ShareService.shareMultipleFiles(filesToShare, shareOptions);
      }

      if (result) {
        ShareService.showShareSuccessToast(
          filesToShare.length === 1 ? filesToShare[0].name : `${filesToShare.length} files`,
          appId
        );
        onShareSuccess?.(filesToShare, appId);
      }

    } catch (error) {
      ShareService.showShareErrorToast(error.message);
      onShareError?.(error);
    } finally {
      setIsSharing(false);
    }
  }, [file, files, onShareSuccess, onShareError]);

  /**
   * Get button text based on file count
   */
  const getButtonText = () => {
    const fileCount = files?.length || (file ? 1 : 0);
    if (fileCount === 0) return 'Share';
    if (fileCount === 1) return `Share ${file?.name || 'File'}`;
    return `Share ${fileCount} Files`;
  };

  /**
   * Get button icon
   */
  const getButtonIcon = () => {
    if (isSharing) return 'loading';
    return 'share';
  };

  /**
   * Render button mode
   */
  const renderButton = () => (
    <Button
      mode="contained"
      onPress={() => showOptions ? setMenuVisible(true) : handleShare()}
      icon={getButtonIcon()}
      loading={isSharing}
      disabled={isSharing || (!file && (!files || files.length === 0))}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
    >
      {getButtonText()}
    </Button>
  );

  /**
   * Render icon mode
   */
  const renderIcon = () => (
    <IconButton
      icon={getButtonIcon()}
      size={size === 'small' ? 20 : size === 'large' ? 32 : 24}
      onPress={() => showOptions ? setMenuVisible(true) : handleShare()}
      disabled={isSharing || (!file && (!files || files.length === 0))}
      style={[styles.iconButton, style]}
    />
  );

  /**
   * Render menu with sharing options
   */
  const renderMenu = () => (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        mode === 'icon' ? renderIcon() : renderButton()
      }
      contentStyle={styles.menuContent}
    >
      <Surface style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Share Options</Text>
      </Surface>
      
      <Menu.Item
        onPress={() => handleShare()}
        title="Share via System"
        leadingIcon="share"
      />
      
      {sharingOptions.map((option) => (
        <Menu.Item
          key={option.id}
          onPress={() => handleQuickShare(option.id)}
          title={option.name}
          leadingIcon={option.icon}
        />
      ))}
    </Menu>
  );

  /**
   * Render quick share chips
   */
  const renderQuickShareChips = () => (
    <View style={styles.chipsContainer}>
      <Text style={styles.chipsTitle}>Quick Share:</Text>
      <View style={styles.chipsRow}>
        {sharingOptions.slice(0, 4).map((option) => (
          <Chip
            key={option.id}
            icon={option.icon}
            onPress={() => handleQuickShare(option.id)}
            style={styles.shareChip}
            disabled={isSharing}
          >
            {option.name}
          </Chip>
        ))}
      </View>
    </View>
  );

  if (isSharing) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Sharing...</Text>
      </View>
    );
  }

  if (showOptions) {
    return (
      <View style={style}>
        {renderMenu()}
        {renderQuickShareChips()}
      </View>
    );
  }

  return mode === 'icon' ? renderIcon() : renderButton();
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 4,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  iconButton: {
    margin: 0,
  },
  menuContent: {
    minWidth: 200,
  },
  menuHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chipsContainer: {
    marginTop: 16,
  },
  chipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  shareChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default ShareButton;


