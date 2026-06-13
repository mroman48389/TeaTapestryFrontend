# Versioning

> Tea Tapestry uses the following version approach. The only version number is kept on the backend
> and is returnable via the /version endpoint. The frontend displays this version on the About
> page. The format for this version number is
>
>     major.minor.patch
>
> where
>
>     major = breaking changes that affect backwards compatibility
>     minor = new features that are backwards compatibility
>     patch = bug fixes with no breaking changes.
>
> So, if changes occur on the backend or frontend or both, you will still only update the version in
> the one place on the backend as appropriate. The What's New page on the frontend will keep the
> history of the changes by version number and date.