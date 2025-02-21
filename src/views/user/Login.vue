<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login layout-input" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs
        :activeKey="customActiveKey"
        size="large"
        :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"
        @change="handleTabClick"
      >
        <a-tab-pane key="tab2" tab="短信登录">
          <a-form-item>
            <a-input
              class="phone-input"
              size="large"
              type="text"
              :placeholder="$t('user.login.mobile.placeholder')"
              v-decorator="[
                'mobile',
                {
                  rules: [{ required: true, pattern: /^1[34578]\d{9}$/, message: $t('user.login.mobile.placeholder') }],
                  validateTrigger: 'change',
                },
              ]"
            >
              <span slot="prefix">+86</span>
            </a-input>
          </a-form-item>

          <a-row :gutter="16">
            <a-col class="gutter-row" :span="16">
              <a-form-item>
                <a-input
                  size="large"
                  type="text"
                  placeholder="请输入验证码"
                  v-decorator="[
                    'code',
                    {
                      rules: [{ required: true, message: $t('user.verification-code.required') }],
                      validateTrigger: 'blur',
                    },
                  ]"
                >
                </a-input>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <a-button
                class="getCaptcha login-btn"
                tabindex="-1"
                :disabled="state.smsSendBtn"
                @click.stop.prevent="getCaptcha"
                v-text="(!state.smsSendBtn && $t('user.register.get-verification-code')) || state.time + ' s'"
              ></a-button>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="tab1" tab="密码登录">
          <a-alert
            v-if="isLoginError"
            type="error"
            showIcon
            style="margin-bottom: 24px"
            :message="$t('user.login.message-invalid-credentials')"
          />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              :placeholder="$t('user.login.username.placeholder')"
              v-decorator="[
                'mobile',
                {
                  rules: [
                    { required: true, message: $t('user.userName.required') },
                    { validator: handleUsernameOrEmail },
                  ],
                  validateTrigger: 'change',
                },
              ]"
            >
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input-password
              size="large"
              :placeholder="$t('user.login.password.placeholder')"
              v-decorator="[
                'password',
                { rules: [{ required: true, message: $t('user.password.required') }], validateTrigger: 'blur' },
              ]"
            >
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input-password>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>

      <a-form-item>
        <a-checkbox v-decorator="['rememberMe', { valuePropName: 'checked' }]">{{
          $t('user.login.remember-me')
        }}</a-checkbox>
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button login-btn"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >{{ $t('user.login.login') }}</a-button
        >
      </a-form-item>

      <div class="user-login-other">
        <router-link class="register" :to="{ name: 'register' }">{{ $t('user.login.signup') }}</router-link>
      </div>
    </a-form>
  </div>
</template>

<script>
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { AIGetCode } from '@/api/login'

export default {
  components: {
    TwoStepCaptcha,
  },
  data() {
    return {
      customActiveKey: 'tab2',
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      isLoginError: false,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 0,
        smsSendBtn: false,
      },
    }
  },
  methods: {
    ...mapActions(['Login', 'Logout', 'AILoginByCode']),
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const { state } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      callback()
    },
    handleTabClick(key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        customActiveKey,
        Login,
        AILoginByCode,
      } = this

      state.loginBtn = true

      const validateFieldsKey = customActiveKey === 'tab1' ? ['mobile', 'password'] : ['mobile', 'code']

      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          const loginParams = { ...values }
          if (customActiveKey === 'tab1') {
            // 账号密码登录
            delete loginParams.code
            Login(loginParams)
              .then((res) => this.loginSuccess(res))
              .catch((err) => this.requestFailed(err))
              .finally(() => {
                state.loginBtn = false
              })
          } else if (customActiveKey === 'tab2') {
            // 短信验证码登录
            delete loginParams.password
            AILoginByCode(loginParams)
              .then((res) => this.loginSuccess(res))
              .catch((err) => this.requestFailed(err))
              .finally(() => {
                state.loginBtn = false
              })
          }
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    getCaptcha(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
      } = this

      validateFields(['mobile'], { force: true }, (err, values) => {
        if (!err) {
          state.smsSendBtn = true

          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          this.$message.loading('验证码发送中..')
          AIGetCode({ mobile: values.mobile })
            .then((res) => {
              this.$message.success('发送成功')
            })
            .catch((err) => {
              setTimeout(hide, 1)
              clearInterval(interval)
              state.time = 60
              state.smsSendBtn = false
              this.requestFailed(err)
            })
        }
      })
    },
    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    loginSuccess(res) {
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`,
        })
      }, 1000)
      this.isLoginError = false
    },
    requestFailed(err) {
      this.isLoginError = true
      this.$notification['error']({
        message: '错误',
        description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
        duration: 4,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .login-btn {
    background: #1b69ff;
    border-radius: 21px;
    font-family: PingFangSC-Regular;
    color: rgba(255, 255, 255, 0.98);
    letter-spacing: 0;
    font-weight: 400;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
    & /deep/ span {
      color: #fff !important;
    }
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
.layout-input /deep/ span {
  font-family: PingFangSC-Regular;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0;
  font-weight: 400;
}
.layout-input .phone-input/deep/ .ant-input {
  padding-left: 55px;
}
.layout-input /deep/ .ant-input {
  font-size: 16px;
  background: #f2f7ff;
  border-radius: 21px;
}
</style>
