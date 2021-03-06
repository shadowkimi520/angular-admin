import { Router } from '@angular/router';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '@app/api.service';
import { Base64 } from 'js-base64';

@Component({
  selector: 'options',
  encapsulation: ViewEncapsulation.Emulated,
  styles: [require('./options.scss')],
  template: require('./options.html'),
})
export class Options {

	// url
  private _authApiUrl = '/auth';
  private _optionApiUrl = '/option';

	// authForm
	public authForm:FormGroup;
	public name:AbstractControl;
	public slogan:AbstractControl;
	public gravatar:AbstractControl;
	public password:AbstractControl;
	public new_password:AbstractControl;
	public rel_new_password:AbstractControl;

	// optionForm
	public optionForm:FormGroup;
	public _id:AbstractControl;
	public title:AbstractControl;
  public sub_title:AbstractControl;
  public keywords:AbstractControl;
  public description:AbstractControl;
  public site_url:AbstractControl;
  public site_email:AbstractControl;
  public site_icp:AbstractControl;
  public seo_ping_sites:AbstractControl;
  public blacklist_ips:AbstractControl;
  public blacklist_mails:AbstractControl;
  public blacklist_keywords:AbstractControl;

  constructor(private _router: Router,
  						private _fb: FormBuilder,
  						private _apiService: ApiService) {

  	// authForm
		this.authForm = _fb.group({
			'name': ['', Validators.compose([Validators.required])],
			'slogan': ['', Validators.compose([Validators.required])],
			'gravatar': ['', Validators.compose([Validators.required])],
			'password': [''],
			'new_password': [''],
			'rel_new_password': [''],
		});
		this.name = this.authForm.controls['name'];
		this.slogan = this.authForm.controls['slogan'];
		this.gravatar = this.authForm.controls['gravatar'];
		this.password = this.authForm.controls['password'];
		this.new_password = this.authForm.controls['new_password'];
		this.rel_new_password = this.authForm.controls['rel_new_password'];

		// optionForm
		this.optionForm = _fb.group({
			'_id': [null],
			'title': [''],
			'sub_title': [''],
			'keywords': [[]],
			'description': [''],
			'site_url': [''],
			'site_email': ['', Validators.compose([Validators.pattern('([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+')])],
			'site_icp': [''],
			'seo_ping_sites': [[]],
			'blacklist_ips': [[]],
			'blacklist_mails': [[]],
			'blacklist_keywords': [[]]
		});
		this._id = this.optionForm.controls['_id'];
		this.title = this.optionForm.controls['title'];
		this.sub_title = this.optionForm.controls['sub_title'];
		this.keywords = this.optionForm.controls['keywords'];
		this.description = this.optionForm.controls['description'];
		this.site_url = this.optionForm.controls['site_url'];
		this.site_email = this.optionForm.controls['site_email'];
		this.site_icp = this.optionForm.controls['site_icp'];
		this.seo_ping_sites = this.optionForm.controls['seo_ping_sites'];
		this.blacklist_ips = this.optionForm.controls['blacklist_ips'];
		this.blacklist_mails = this.optionForm.controls['blacklist_mails'];
		this.blacklist_keywords = this.optionForm.controls['blacklist_keywords'];
	}

	// ping??????????????????
	public pingSitesChangeHandle(event) {
		const newData = event.target.value.replace(/\s+/g, ' ').replace(/\s/g, '\n');
		this.seo_ping_sites.setValue(newData);
	}

	// ?????????ip????????????
	public commentBlacklistIpsChangeHandle(event) {
		const newData = event.target.value.replace(/\s+/g, ' ').replace(/\s/g, '\n');
		this.blacklist_ips.setValue(newData);
	}

	// ???????????????????????????
	public commentBlacklistMailsChangeHandle(event) {
		const newData = event.target.value.replace(/\s+/g, ' ').replace(/\s/g, '\n');
		this.blacklist_mails.setValue(newData);
	}

	// ??????????????????????????????
	public commentBlacklistKeywordsChangeHandle(event) {
		const newData = event.target.value.replace(/\s+/g, ' ').replace(/\s/g, '\n');
		this.blacklist_keywords.setValue(newData);
	}

	// ?????????????????????
	public keywordsChangeHandle(event) {
		const newWords = event.target.value.replace(/\s/g, '').split(',');
  	this.keywords.setValue(newWords);
	}

	// ??????????????????
	public submitAuthForm(values: any) {
		if (this.authForm.valid) {
			const authFormData = this.authForm.value;
			const newformData = {};
			Object.keys(authFormData).forEach(key => {
				if (authFormData[key]) {
					if (key.includes('password')) {
						newformData[key] = Base64.encode(authFormData[key]);
					} else {
						newformData[key] = authFormData[key];
					}
				}
			});
			this.putAuth(newformData);
		}
	}

	// ??????????????????
	public submitOptionForm(values: any) {
		if (this.optionForm.valid) {
			const formValue = Object.assign({
				ping_sites: new String(this.seo_ping_sites.value).split('\n').filter(t => !!t),
				blacklist: {
					ips: new String(this.blacklist_ips.value).split('\n').filter(t => !!t),
					mails: new String(this.blacklist_mails.value).split('\n').filter(t => !!t),
					keywords: new String(this.blacklist_keywords.value).split('\n').filter(t => !!t)
				}
			}, this.optionForm.value)
			this.putOptions(formValue);
		}
	}

	// ?????????????????????????????????
	public handleAuthChange = userAuthPromise => {
		userAuthPromise.then(({ result: { name, slogan, gravatar }}) => {
			if (this.authForm.value.rel_new_password) {
				console.info('??????????????????????????????????????????');
				setTimeout(() => {
					this._router.navigate(['/auth']);
				}, 960)
			} else {
				this.authForm.reset({
					name,
					slogan,
					gravatar,
					password: '',
					new_password: '',
					rel_new_password: ''
				});
			}
		})
		.catch(error => {});
	}

	// ?????????????????????????????????
	public handleOptionChange = optionPromise => {
		optionPromise.then(({ result: options }) => {
			options.seo_ping_sites = options.ping_sites.toString().replace(/,/g, '\n');
			options.blacklist_ips = options.blacklist.ips.toString().replace(/,/g, '\n');
			options.blacklist_mails = options.blacklist.mails.toString().replace(/,/g, '\n');
			options.blacklist_keywords = options.blacklist.keywords.toString().replace(/,/g, '\n');
			this.optionForm.reset(options);
		})
		.catch(error => {});
	}

	// ????????????
	public getUserAuth() {
		this.handleAuthChange(this._apiService.get(this._authApiUrl));
	}

	// ????????????
	public putAuth(auth: any) {
		this.handleAuthChange(this._apiService.put(this._authApiUrl, auth));
	}

	// ????????????
	public getOptions() {
		this.handleOptionChange(this._apiService.get(this._optionApiUrl));
	}

	// ????????????
	public putOptions(options: any) {
		this.handleOptionChange(this._apiService.put(this._optionApiUrl, options));
	}

	ngOnInit() {
		this.getOptions();
		this.getUserAuth();
	}
}
