// Generated by typescript generator

export type SessionToken = {
	message: SessionMessage;
	signed_message: Signature;
};

export type SessionMessage = {
	prompt: string;
	disposable_pubkey: string;
	timestamp: number;
};

export type Signature = {
	r: string;
	s: string;
	v: number;
};