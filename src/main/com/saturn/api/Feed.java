package com.saturn.api;

import java.io.Closeable;
import java.util.Iterator;

public abstract class Feed<T> implements Iterator<Timestamped<T>>, Closeable {

	@Override
	public void remove() {
		throw new UnsupportedOperationException();
	}
}
