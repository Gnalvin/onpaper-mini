export type profileType =
  | 'userName'
  | 'sex'
  | 'birthday'
  | 'workEmail'
  | 'region'
  | 'snsLink'
  | 'createStyle'
  | 'software'
  | 'exceptWork'
  | 'introduce'

export interface IUpdateData {
  profileType: profileType
  profile: string
}
