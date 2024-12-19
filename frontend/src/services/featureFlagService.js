const featureFlags = {
    hideAuthButtons: false,
  };
  
  class FeatureFlagService {
    static getFlagValue(flagKey, defaultValue = false) {
      return featureFlags[flagKey] ?? defaultValue;
    }
  }
  
  export default FeatureFlagService;
  