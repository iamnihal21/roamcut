import { useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/theme';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUri: string | null;
  onClose: () => void;
}

export const VideoPlayerModal = ({ visible, videoUri, onClose }: VideoPlayerModalProps) => {
  // Initialize player (empty string if no uri yet)
  const player = useVideoPlayer(videoUri || '', (player) => {
    player.loop = true;
  });

  useEffect(() => {
    if (visible && videoUri) {
      player.play();
    } else {
      player.pause();
    }
  }, [visible, videoUri, player]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        
        <VideoView 
          player={player} 
          style={styles.video} 
          nativeControls={true} 
          contentFit="contain"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  video: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: '85%',
  },
});