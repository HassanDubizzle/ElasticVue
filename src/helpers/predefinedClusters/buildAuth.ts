import { AuthType, ElasticsearchClusterAuth } from '../../store/connection.ts'
import { PredefinedCluster } from '../../composables/components/predefinedclusters/PredefinedClusters.ts'

export const buildAuth = (cluster: PredefinedCluster): ElasticsearchClusterAuth => {
  const { username, password, apiKey, S3accessKeyId, S3secretAccessKey, S3sessionToken, S3region, awsRegion } = cluster

  if (username?.length && password?.length) {
    return {
      authType: AuthType.basicAuth,
      authData: { username, password }
    }
  }

  if (password?.length) {
    return {
      authType: AuthType.apiKey,
      authData: { apiKey: password }
    }
  }

  if (apiKey?.length) {
    return {
      authType: AuthType.apiKey,
      authData: { apiKey }
    }
  }

  if (awsRegion?.length && !S3accessKeyId?.length && !S3secretAccessKey?.length) {
    return {
      authType: AuthType.awsSystemCredentials,
      authData: { region: awsRegion }
    }
  }

  if (S3accessKeyId?.length && S3secretAccessKey?.length) {
    return {
      authType: AuthType.awsIAM,
      authData: {
        accessKeyId: S3accessKeyId,
        secretAccessKey: S3secretAccessKey,
        sessionToken: S3sessionToken,
        region: S3region
      }
    }
  }

  return {
    authType: AuthType.none,
    authData: {}
  }
}
