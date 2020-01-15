using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Sabio.Models.Requests
{
    public class FAQAddRequest
    {

            [StringLength(255, MinimumLength = 2)]
            public string Question { get; set; }

            [StringLength(255, MinimumLength = 2)]
            public string Answer { get; set; }

            [Required, Range(1, int.MaxValue)]
            public int CategoryId { get; set; }

            [Required, Range(1, int.MaxValue)]
            public int SortOrder { get; set; }
            
    }
}
