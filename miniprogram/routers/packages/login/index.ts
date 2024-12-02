const subPackage = {
  root: '/packages/login'
}

const wxPageRoute = {
  path: '/wx-login/index',
  name: 'WxLoginPage',
  subPackage
}
const PhoneLoginRoute = {
  path: '/phone-login/index',
  name: 'PhoneLoginPage',
  subPackage
}

const PasswordLoginRoute = {
  path: '/password-login/index',
  name: 'PasswordLoginPage',
  subPackage
}

export const LoginRoute = [wxPageRoute, PhoneLoginRoute, PasswordLoginRoute]
