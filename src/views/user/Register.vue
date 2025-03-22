<template>
  <div class="main user-layout-register layout-input">
    <div class="register-title">{{ $t('user.register.register') }}</div>
    <a-form ref="formRegister" :form="form" id="formRegister">
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="姓名"
          v-decorator="[
            'userName',
            {
              rules: [{ required: true, message: $t('user.email.required') }],
              validateTrigger: ['change', 'blur'],
            },
          ]"
        ></a-input>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          class="phone-input"
          :placeholder="$t('user.login.mobile.placeholder')"
          v-decorator="[
            'mobile',
            {
              rules: [{ required: true, message: $t('user.phone-number.required'), pattern: /^1[3456789]\d{9}$/ }],
              validateTrigger: ['change', 'blur'],
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
              type="number"
              :placeholder="$t('user.login.mobile.verification-code.placeholder')"
              v-decorator="[
                'smsCode',
                { rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur' },
              ]"
            >
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button
            class="getCaptcha login-btn"
            size="large"
            :disabled="state.smsSendBtn"
            @click.stop.prevent="getCaptcha"
            v-text="(!state.smsSendBtn && $t('user.register.get-verification-code')) || state.time + ' s'"
          ></a-button>
        </a-col>
      </a-row>

      <a-popover
        placement="rightTop"
        :trigger="['focus']"
        :getPopupContainer="(trigger) => trigger.parentElement"
        v-model="state.passwordLevelChecked"
      >
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">{{ $t(passwordLevelName) }}</div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor="passwordLevelColor" />
            <div style="margin-top: 10px">
              <span>{{ $t('user.register.password.popover-message') }} </span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input-password
            size="large"
            @click="handlePasswordInputClick"
            :placeholder="$t('user.register.password.placeholder')"
            v-decorator="[
              'password',
              {
                rules: [
                  { required: true, message: $t('user.password.required') },
                  { validator: this.handlePasswordLevel },
                ],
                validateTrigger: ['change', 'blur'],
              },
            ]"
          ></a-input-password>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input-password
          size="large"
          :placeholder="$t('user.register.confirm-password.placeholder')"
          v-decorator="[
            'password2',
            {
              rules: [
                { required: true, message: $t('user.password.required') },
                { validator: this.handlePasswordCheck },
              ],
              validateTrigger: ['change', 'blur'],
            },
          ]"
        ></a-input-password>
      </a-form-item>

      <a-form-item>
        <cascader
          :allowClear="true"
          :options="bankList"
          :show-search="{ filter }"
          placeholder="请选择所属银行"
          @change="onBankChoose"
        >
        </cascader>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="岗位工号"
          v-decorator="[
            'jobNumber',
            {
              rules: [{ required: true, message: '选择岗位工号' }],
              validateTrigger: ['change', 'blur'],
            },
          ]"
        >
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button login-btn"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn"
          >{{ $t('user.register.register') }}
        </a-button>
        <router-link class="login" :to="{ name: 'login' }">{{ $t('user.register.sign-in') }}</router-link>
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model="checkNick" class="flex xieyi-box">
          <div class="flex">
            我已阅读并同意
            <div class="xieyi" @click="toXieYiPop('user')">《用户协议》</div>
            <div class="xieyi" @click="toXieYiPop('yinsi')">《隐私权政策》</div>
          </div>
        </a-checkbox>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { Cascader } from 'ant-design-vue'
import { AIRegisterSmsCode, AIRegister } from '@/api/login'
import { bankTree } from '@/api/qrcode'
import { deviceMixin } from '@/store/device-mixin'
import { scorePassword, transformData } from '@/utils/util'
const levelNames = {
  0: 'user.password.strength.short',
  1: 'user.password.strength.low',
  2: 'user.password.strength.medium',
  3: 'user.password.strength.strong',
}
const levelClass = {
  0: 'error',
  1: 'error',
  2: 'warning',
  3: 'success',
}
const levelColor = {
  0: '#ff0000',
  1: '#ff0000',
  2: '#ff7e05',
  3: '#52c41a',
}
export default {
  name: 'Register',
  components: { Cascader },
  mixins: [deviceMixin],
  data() {
    return {
      form: this.$form.createForm(this),
      checkNick: false,
      state: {
        time: 60,
        level: 0,
        smsSendBtn: false,
        passwordLevel: 0,
        passwordLevelChecked: false,
        percent: 10,
        progressColor: '#FF0000',
      },
      registerBtn: false,
      bankList: [],
      selectedBank: {
        bankName1: '',
        bankName2: '',
        bankId1: null,
        bankId2: null,
      },
    }
  },
  computed: {
    passwordLevelClass() {
      return levelClass[this.state.passwordLevel]
    },
    passwordLevelName() {
      return levelNames[this.state.passwordLevel]
    },
    passwordLevelColor() {
      return levelColor[this.state.passwordLevel]
    },
  },
  created() {
    bankTree().then((res) => {
      this.bankList = res.data.map(transformData)
    })
  },
  methods: {
    // 企业选择
    filter(inputValue, path) {
      return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
    },
    onBankChoose(value, selectedOptions) {
      if (!selectedOptions) {
        this.selectedBank = {
          bankName1: '',
          bankName2: '',
          bankId1: null,
          bankId2: null,
        }
        return
      }
      selectedOptions.forEach((item) => {
        if (!item.pid) {
          this.selectedBank.bankId1 = item.value
          this.selectedBank.bankName1 = item.label
        } else {
          this.selectedBank.bankId2 = item.value
          this.selectedBank.bankName2 = item.label
        }
      })
    },
    handlePasswordLevel(rule, value, callback) {
      if (!value) {
        return callback()
      }
      if (value.length >= 6) {
        if (scorePassword(value) >= 30) {
          this.state.level = 1
        }
        if (scorePassword(value) >= 60) {
          this.state.level = 2
        }
        if (scorePassword(value) >= 80) {
          this.state.level = 3
        }
      } else {
        this.state.level = 0
        callback(new Error(this.$t('user.password.strength.msg')))
      }
      this.state.passwordLevel = this.state.level
      this.state.percent = this.state.level * 33

      callback()
    },
    toXieYiPop(type) {
      console.log('打开协议', type)
    },
    handlePasswordCheck(rule, value, callback) {
      const password = this.form.getFieldValue('password')
      if (value === undefined) {
        callback(new Error(this.$t('user.password.required')))
      }
      if (value && password && value.trim() !== password.trim()) {
        callback(new Error(this.$t('user.password.twice.msg')))
      }
      callback()
    },
    handlePasswordInputClick() {
      if (!this.isMobile) {
        this.state.passwordLevelChecked = true
        return
      }
      this.state.passwordLevelChecked = false
    },

    handleSubmit() {
      const {
        form: { validateFields },
        state,
        $router,
        $notification,
      } = this
      validateFields({ force: true }, (err, values) => {
        if (!err) {
          if (!this.checkNick) {
            $notification['info']({
              message: '提示',
              description: '请您仔细阅读并勾选用户协议与隐私政策，这是完成注册的必要步骤，以确保您的权益得到充分保障。',
              duration: 8,
            })
            return
          }
          this.registerBtn = true
          state.passwordLevelChecked = false
          let request = Object.assign(values, this.selectedBank)
          delete request.password2
          AIRegister(request).then((res) => {
            this.registerBtn = false
            if (res.code == 200) {
              $notification['success']({
                message: '提示',
                description: '注册成功！',
                duration: 8,
              })
              setTimeout(() => {
                $router.push({ name: 'login' })
              }, 1200)
            } else {
              this.requestFailed(res)
            }
          })
          // $router.push({ name: 'registerResult', params: { ...values } })
        }
      })
    },

    getCaptcha(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        $message,
        $notification,
      } = this

      validateFields(['mobile'], { force: true }, (err, values) => {
        if (!err) {
          const hide = $message.loading('验证码发送中..', 0)

          AIRegisterSmsCode({ mobile: values.mobile }).then((res) => {
            setTimeout(hide, 1000)
            if (res.code == 200) {
              state.smsSendBtn = true
              const interval = window.setInterval(() => {
                if (state.time-- <= 0) {
                  state.time = 60
                  state.smsSendBtn = false
                  window.clearInterval(interval)
                }
              }, 1000)
            } else {
              $notification['warn']({
                message: '通知：',
                description: `错误${res.code}：${res.msg}`,
                duration: 8,
              })
            }
          })
        }
      })
    },
    requestFailed(err) {
      this.$notification['error']({
        message: '错误',
        description: err.msg || '请求出现错误，请稍后再试',
        duration: 4,
      })
      this.registerBtn = false
    },
  },
}
</script>
<style lang="less">
.user-register {
  &.error {
    color: #ff0000;
  }

  &.warning {
    color: #ff7e05;
  }

  &.success {
    color: #52c41a;
  }
}

.user-layout-register {
  .ant-input-group-addon:first-child {
    background-color: #fff;
  }
}
.anticon-close-circle {
  z-index: 1000;
}
</style>
<style lang="less" scoped>
.user-layout-register {
  .register-title {
    font-size: 22px;
    margin-bottom: 20px;
    font-weight: bold;
  }
  .login-btn {
    background: #1890ff;
    border-radius: 21px;
    font-family: PingFangSC-Regular;
    color: rgba(255, 255, 255, 0.98);
    letter-spacing: 0;
    font-weight: 400;
  }
  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .register-button {
    width: 50%;
    & /deep/ span {
      color: #fff !important;
    }
  }

  .login {
    float: right;
    line-height: 40px;
  }
}
.layout-input /deep/ span {
  font-family: PingFangSC-Regular;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0;
  font-weight: 400;
  z-index: 1000;
}
.layout-input .phone-input/deep/ .ant-input {
  padding-left: 55px;
}
.layout-input /deep/ .ant-input {
  font-size: 16px;
  background: #f2f7ff !important;
  border-radius: 21px;
  border: none;
}
.layout-input /deep/ .to-select {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #1890ff;
  letter-spacing: 0;
  font-weight: 400;
  cursor: pointer;
}
.xieyi-box {
  align-items: center;
  line-height: 1;
  .xieyi {
    font-family: PingFangSC-Regular;
    color: #1890ff;
    font-weight: 400;
    cursor: pointer;
    &:hover {
      border-bottom: 1px solid #1890ff;
    }
  }
}
</style>
