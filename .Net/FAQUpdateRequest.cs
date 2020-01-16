using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Sabio.Models.Requests
{
    public class FAQUpdateRequest : FAQAddRequest, IModelIdentifier
    {
        [Required, Range(1, int.MaxValue)]
        public int Id { get; set; }
    }
}
